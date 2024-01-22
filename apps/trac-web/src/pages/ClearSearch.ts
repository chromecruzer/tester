import {useNavigate} from "react-router";
import {useTracContext} from "../TracContext";
import PagesMap from "../navigation/PagesMap";
import {useEffect} from "react";

const pagesMap = new PagesMap();
const ClearSearch = () => {
  const navigateTo = useNavigate();
  const {setTracContext} = useTracContext();
  useEffect(() => {
    console.log('clearing search');
    setTracContext('search', {text: null, filters: {}})
    navigateTo(pagesMap.page('Search'));
  })
}
export default ClearSearch;
