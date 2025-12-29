import Sales from "../models/Sales.js";
import Stock from "../models/Stock.js";
import { errorHandler } from "../middlewares/errorHandler.js";
import puppeteer from "puppeteer";


// Generating report data
const generateReportData = async (periodType, periodValue) => {

  const endDate = new Date();
  const startDate = new Date();

  if(periodType === "weekly") {
    startDate.setDate(endDate.getDate() - 7);
  } else if (periodType === "months") {
    const months = parseInt(periodValue) || 3;
    startDate.setMonth(endDate.getMonth() - months);
  } else {
    startDate.setMonth(endDate.getMonth() - 3);
  }

  const allSales = await Sales.find({
    saleDate: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ saleDate: 1 });

  const totalRevenue = allSales.reduce((sum, sale) => sum + sale.quantitySold * sale.price, 0);
  const totalQuantity = allSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
  const totalSales = allSales.length;
  const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  const salesByDate = {};
  allSales.forEach((sale) => {
    const dateKey = sale.saleDate.toISOString().split("T")[0];
    if(!salesByDate[dateKey]) {
      salesByDate[dateKey] = {
        date: dateKey,
        quantity: 0,
        revenue: 0,
        count: 0,
      };
    }

    salesByDate[dateKey].quantity += sale.quantitySold;
    salesByDate[dateKey].revenue += sale.quantitySold * sale.price;
    salesByDate[dateKey].count += 1;

  });

  const salesTrend = Object.values(salesByDate).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const peakDay = salesTrend.reduce((max, day) => 
    day.revenue > max.revenue ? day : max, 
    salesTrend[0] || { date: null, revenue: 0 }
  );

  const salesByItem = {};
  allSales.forEach((sale) => {
    const key = sale.itemName;
    if(!salesByItem[key]) {
      salesByItem[key] = {
        itemName: sale.itemName,
        companyName: sale.companyName,
        totalQuantity: 0,
        totalRevenue: 0,
        saleCount: 0,
        firstSaleDate: sale.saleDate,
        lastSaleDate: sale.saleDate,
      };
    }

    salesByItem[key].totalQuantity += sale.quantitySold;
    salesByItem[key].totalRevenue += sale.quantitySold * sale.price;
    salesByItem[key].saleCount += 1;

    if(sale.saleDate < salesByItem[key].firstSaleDate) {
      salesByItem[key].firstSaleDate = sale.saleDate;
    }

    if(sale.saleDate > salesByItem[key].lastSaleDate) {
      salesByItem[key].lastSaleDate = sale.saleDate;
    }

  });

  const itemNames = Object.keys(salesByItem);
  const currentStocks = await Stock.find({
    name: { $in: itemNames },
  });

  const stockMap = {};
  currentStocks.forEach((stock) => {
    if(!stockMap[stock.name]) {
      stockMap[stock.name] = [];
    }

    stockMap[stock.name].push(stock);
  });

  const itemAnalytics = Object.values(salesByItem).map((item) => {

    const daysDiff = (item.lastSaleDate - item.firstSaleDate) / (1000 * 60 * 60 * 24);
    const daysSinceFirstSale = (endDate - item.firstSaleDate) / (1000 * 60 * 60 * 24);
    const salesVelocity = daysSinceFirstSale > 0 ? item.totalQuantity / daysSinceFirstSale : 0;
    const avgDaysBetweenSales = daysSinceFirstSale > 0 ? daysSinceFirstSale / item.saleCount : 0;

    const stocks = stockMap[item.itemName] || [];
    const currentStock = stocks.find((s) => !s.isSoldOut) || stocks[0];
    const isOutOfStock = !currentStock || currentStock.isSoldOut;
    const currentQuantity = currentStock ? currentStock.quantity : 0;

    return {
      ...item,
      salesVelocity,
      avgDaysBetweenSales,
      isOutOfStock,
      currentQuantity,
      performanceScore:
        item.totalRevenue * 0.4 +
        item.totalQuantity * 0.2 +
        (1 / (avgDaysBetweenSales + 1)) * 1000 * 0.2 +
        salesVelocity * 0.2,
    };
  });

  itemAnalytics.sort((a, b) => b.performanceScore - a.performanceScore);

  const bestPerformingItems = itemAnalytics.slice(0, 10);

  const worstPerformingItems = itemAnalytics
    .filter((item) => item.totalQuantity > 0)
    .sort((a, b) => a.totalRevenue - b.totalRevenue)
    .slice(0, 10);

  const salesByCompany = {};
  allSales.forEach((sale) => {
    const key = sale.companyName;

    if(!salesByCompany[key]) {
      salesByCompany[key] = {
        companyName: sale.companyName,
        totalQuantity: 0,
        totalRevenue: 0,
        saleCount: 0,
        uniqueItems: new Set(),
      };
    }

    salesByCompany[key].totalQuantity += sale.quantitySold;
    salesByCompany[key].totalRevenue += sale.quantitySold * sale.price;
    salesByCompany[key].saleCount += 1;
    salesByCompany[key].uniqueItems.add(sale.itemName);

  });

  const companyAnalytics = Object.values(salesByCompany).map((company) => {
    company.uniqueItemsCount = company.uniqueItems.size;
    delete company.uniqueItems;
    return company;
  });

  companyAnalytics.sort((a, b) => b.totalRevenue - a.totalRevenue);

  const restockingSuggestions = itemAnalytics
    .filter((item) => {
      return (
        (item.isOutOfStock || item.currentQuantity < 10) &&
        item.performanceScore > 0
      );
    })
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 10)
    .map((item) => ({
      itemName: item.itemName,
      companyName: item.companyName,
      currentQuantity: item.currentQuantity,
      isOutOfStock: item.isOutOfStock,
      totalRevenue: item.totalRevenue,
      salesVelocity: item.salesVelocity,
      priority: item.isOutOfStock ? "High" : "Medium",
    }));

  const avoidRestocking = itemAnalytics
    .filter((item) => {
      return (
        item.totalRevenue < avgSaleValue * 2 &&
        item.saleCount < 5 &&
        item.salesVelocity < 0.1
      );
    })
    .sort((a, b) => a.totalRevenue - b.totalRevenue)
    .slice(0, 10);

  return {
    period: {
      type: periodType,
      value: periodValue,
      startDate,
      endDate,
    },
    summary: {
      totalRevenue,
      totalQuantity,
      totalSales,
      avgSaleValue,
    },
    peakDay,
    salesTrend,
    bestPerformingItems,
    worstPerformingItems,
    companyAnalytics,
    restockingSuggestions,
    avoidRestocking,
    itemAnalytics,
  };
};


// Generating HTML report template
const generateHTMLReport = (reportData) => {

  const formatDate = (date) => {
    if(!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const periodLabel = reportData.period.type === "weekly" ? "Last Week" : `Last ${reportData.period.value || 3} Months`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventory Management Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #4f46e5;
            font-size: 32px;
            margin-bottom: 10px;
        }
        .header p {
            color: #666;
            font-size: 14px;
        }
        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        .section-title {
            background: #4f46e5;
            color: white;
            padding: 15px 20px;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #4f46e5;
        }
        .summary-card h3 {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        .summary-card .value {
            font-size: 28px;
            font-weight: bold;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
        }
        th {
            background: #4f46e5;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        tr:nth-child(even) {
            background: #f9fafb;
        }
        tr:hover {
            background: #f3f4f6;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
        }
        .badge-high {
            background: #fee2e2;
            color: #991b1b;
        }
        .badge-medium {
            background: #fef3c7;
            color: #92400e;
        }
        .badge-success {
            background: #d1fae5;
            color: #065f46;
        }
        .badge-warning {
            background: #fef3c7;
            color: #92400e;
        }
        .highlight-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .highlight-box h4 {
            color: #1e40af;
            margin-bottom: 8px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .recommendation {
            background: #f0fdf4;
            border: 1px solid #86efac;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
        }
        .warning {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Inventory Management Report</h1>
            <p>Generated on ${formatDate(new Date())} | Period: ${periodLabel}</p>
            <p>Report Period: ${formatDate(reportData.period.startDate)} to ${formatDate(reportData.period.endDate)}</p>
        </div>

        <div class="section">
            <div class="section-title">Executive Summary</div>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Total Revenue</h3>
                    <div class="value">${formatCurrency(reportData.summary.totalRevenue)}</div>
                </div>
                <div class="summary-card">
                    <h3>Total Quantity Sold</h3>
                    <div class="value">${reportData.summary.totalQuantity.toFixed(2)}</div>
                </div>
                <div class="summary-card">
                    <h3>Total Sales</h3>
                    <div class="value">${reportData.summary.totalSales}</div>
                </div>
                <div class="summary-card">
                    <h3>Average Sale Value</h3>
                    <div class="value">${formatCurrency(reportData.summary.avgSaleValue)}</div>
                </div>
            </div>
            ${reportData.peakDay && reportData.peakDay.date ? `
            <div class="highlight-box">
                <h4>📈 Peak Sales Day</h4>
                <p><strong>Date:</strong> ${formatDate(reportData.peakDay.date)}</p>
                <p><strong>Revenue:</strong> ${formatCurrency(reportData.peakDay.revenue)}</p>
                <p><strong>Quantity Sold:</strong> ${reportData.peakDay.quantity.toFixed(2)}</p>
            </div>
            ` : ''}
        </div>

        <div class="section">
            <div class="section-title">Best Performing Items</div>
            <p style="margin-bottom: 15px; color: #666;">Top 10 items by performance score (based on revenue, quantity, sales velocity)</p>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Item Name</th>
                        <th>Company</th>
                        <th>Total Revenue</th>
                        <th>Quantity Sold</th>
                        <th>Sales Velocity</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.bestPerformingItems.map((item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${item.itemName}</strong></td>
                        <td>${item.companyName}</td>
                        <td>${formatCurrency(item.totalRevenue)}</td>
                        <td>${item.totalQuantity.toFixed(2)}</td>
                        <td>${item.salesVelocity.toFixed(2)} units/day</td>
                        <td>${item.isOutOfStock ? '<span class="badge badge-warning">Out of Stock</span>' : '<span class="badge badge-success">Available</span>'}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Restocking Suggestions</div>
            <p style="margin-bottom: 15px; color: #666;">Items that are out of stock or low in stock and have good performance</p>
            ${reportData.restockingSuggestions.length > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>Priority</th>
                        <th>Item Name</th>
                        <th>Company</th>
                        <th>Current Quantity</th>
                        <th>Total Revenue</th>
                        <th>Sales Velocity</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.restockingSuggestions.map((item) => `
                    <tr>
                        <td><span class="badge ${item.priority === 'High' ? 'badge-high' : 'badge-medium'}">${item.priority}</span></td>
                        <td><strong>${item.itemName}</strong></td>
                        <td>${item.companyName}</td>
                        <td>${item.isOutOfStock ? '<span style="color: red;">Out of Stock</span>' : item.currentQuantity}</td>
                        <td>${formatCurrency(item.totalRevenue)}</td>
                        <td>${item.salesVelocity.toFixed(2)} units/day</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : '<p style="color: #666; padding: 20px;">No restocking suggestions at this time.</p>'}
        </div>

        <div class="section">
            <div class="section-title">Items to Avoid Restocking</div>
            <p style="margin-bottom: 15px; color: #666;">Items with poor performance that should not be prioritized for restocking</p>
            ${reportData.avoidRestocking.length > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Company</th>
                        <th>Total Revenue</th>
                        <th>Quantity Sold</th>
                        <th>Sales Count</th>
                        <th>Sales Velocity</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.avoidRestocking.map((item) => `
                    <tr>
                        <td><strong>${item.itemName}</strong></td>
                        <td>${item.companyName}</td>
                        <td>${formatCurrency(item.totalRevenue)}</td>
                        <td>${item.totalQuantity.toFixed(2)}</td>
                        <td>${item.saleCount}</td>
                        <td>${item.salesVelocity.toFixed(2)} units/day</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : '<p style="color: #666; padding: 20px;">No items identified for avoiding restocking.</p>'}
        </div>

        <div class="section">
            <div class="section-title">Company Performance</div>
            <p style="margin-bottom: 15px; color: #666;">Performance breakdown by company</p>
            <table>
                <thead>
                    <tr>
                        <th>Company Name</th>
                        <th>Total Revenue</th>
                        <th>Total Quantity</th>
                        <th>Sales Count</th>
                        <th>Unique Items</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.companyAnalytics.map((company) => `
                    <tr>
                        <td><strong>${company.companyName}</strong></td>
                        <td>${formatCurrency(company.totalRevenue)}</td>
                        <td>${company.totalQuantity.toFixed(2)}</td>
                        <td>${company.saleCount}</td>
                        <td>${company.uniqueItemsCount}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Key Recommendations</div>
            <div class="recommendation">
                <h4>Priority Restocking</h4>
                <p>Focus on restocking items marked as "High Priority" in the Restocking Suggestions section. These items have proven performance and are currently out of stock.</p>
            </div>
            ${reportData.peakDay && reportData.peakDay.date ? `
            <div class="recommendation">
                <h4>Peak Sales Period</h4>
                <p>The peak sales day was ${formatDate(reportData.peakDay.date)} with revenue of ${formatCurrency(reportData.peakDay.revenue)}. Consider increasing inventory before similar periods.</p>
            </div>
            ` : ''}
            ${reportData.avoidRestocking.length > 0 ? `
            <div class="warning">
                <h4>Low Performance Items</h4>
                <p>${reportData.avoidRestocking.length} items have shown poor performance. Consider reducing inventory levels or discontinuing these items.</p>
            </div>
            ` : ''}
            <div class="recommendation">
                <h4>Best Performing Companies</h4>
                <p>Focus on maintaining strong relationships with top-performing companies and ensure adequate stock levels for their products.</p>
            </div>
        </div>

        <div class="footer">
            <p>This report was automatically generated by the Inventory Management System</p>
            <p>For questions or support, please contact your system administrator</p>
        </div>
    </div>
</body>
</html>
  `;
};


// Generating PDF report
export const generateReport = async (req, res, next) => {

  try {

    const { periodType, periodValue } = req.query;

    if(!periodType) {
      return next(errorHandler(400, "Period type is required (weekly or months)"));
    }

    if(periodType === "months" && !periodValue) {
      return next(errorHandler(400, "Period value is required for months (e.g., 3, 6, 12)"));
    }

    const reportData = await generateReportData(periodType, periodValue || "3");

    const htmlContent = generateHTMLReport(reportData);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    await browser.close();

    const periodLabel = periodType === "weekly" ? "week" : `${periodValue || 3}months`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="inventory-report-${periodLabel}-${Date.now()}.pdf"`
    );

    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error generating report:", error);
    next(error);
  }
};


// Getting report data (for preview)
export const getReportData = async (req, res, next) => {

  try {

    const { periodType, periodValue } = req.query;

    if(!periodType) {
      return next(errorHandler(400, "Period type is required (weekly or months)"));
    }

    if(periodType === "months" && !periodValue) {
      return next(errorHandler(400, "Period value is required for months (e.g., 3, 6, 12)"));
    }

    const reportData = await generateReportData(periodType, periodValue || "3");

    res.status(200).json({
      success: true,
      data: reportData,
    });

  } catch (error) {
    next(error);
  }
};

