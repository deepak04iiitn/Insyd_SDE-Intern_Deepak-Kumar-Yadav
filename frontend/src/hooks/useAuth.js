import { useSelector, useDispatch } from "react-redux";
import { logout as logoutAction, getMe } from "../lib/slices/authSlice";
import { useRouter } from "next/navigation";

export const useAuth = () => {

  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state) => state.auth);

  const logout = () => {
    dispatch(logoutAction());
    router.push("/login");
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

