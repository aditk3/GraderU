import axios from "axios";

const api = axios.create({
  withCredentials: true,
  credentials: "same-origin",
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://graderu.herokuapp.com/api/v1"
      : "http://localhost:4000/api/v1",
});

export default api;
