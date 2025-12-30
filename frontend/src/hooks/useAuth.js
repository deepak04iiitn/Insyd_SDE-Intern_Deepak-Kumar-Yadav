import { useSelector, useDispatch } from "react-redux";
import { logoutAsync, getMe } from "../lib/slices/authSlice";
import { useRouter } from "next/navigation";

export const useAuth = () => {

  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state) => state.auth);

  const logout = async () => {

    try {
      await dispatch(logoutAsync()).unwrap();
    } catch (error) {
      // continuing with logout even if API call fails
    } finally {
      if(typeof window !== "undefined") {
        localStorage.removeItem("persist:root");
      }
      router.push("/login");
    }
    
  };

  const refreshUser = () => {
    if(auth.token) {
      dispatch(getMe());
    }
  };

  return {
    ...auth,
    logout,
    refreshUser,
    isAdmin: auth.user?.role === "admin",
  };
  
};

