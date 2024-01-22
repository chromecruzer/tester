import axios from "axios";
import {httpRoot} from "../httpConfig";

const refreshApi = axios.create({
  baseURL: `${httpRoot}`,
});
export const postDataRefresh = async user => {
  return refreshApi.post(`/refresh`, {user})
}
