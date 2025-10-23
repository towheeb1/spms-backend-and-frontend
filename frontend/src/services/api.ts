// src/services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Response interceptor: on 401 try to refresh once and retry the request
let isRefreshing = false;
let failedQueue: Array<{resolve: (val?: any) => void; reject: (err: any) => void; config: any}> = [];

const processQueue = (error: any, token: any = null) => {
  failedQueue.forEach(p => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config;
    if (!originalConfig) return Promise.reject(err);

    if (err.response && err.response.status === 401 && !originalConfig._retry) {
      if (isRefreshing) {
        // queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalConfig });
        })
          .then(() => api(originalConfig))
          .catch((e) => Promise.reject(e));
      }

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        // call refresh endpoint using a bare axios instance to avoid loops
        await axios.post("http://localhost:4000/auth/refresh", {}, { withCredentials: true });
        processQueue(null, true);
        return api(originalConfig);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

// ==== New: searchMedicines (مطابق لاستيرادك في POS.tsx) ====
// يرجّع مصفوفة أدوية: [{id,name,generic_name,form,strength,barcode,price,stock_qty}]
export async function searchMedicines(q: string) {
  const { data } = await api.get("/medicines/search", { params: { q } });
  return data.items as Array<{
    id: number;
    name: string;
    generic_name?: string;
    form?: string;
    strength?: string;
    barcode?: string;
    price?: number;
    stock_qty?: number;
  }>;
}
