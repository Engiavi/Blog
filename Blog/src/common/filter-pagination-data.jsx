import axios from "axios";
const FilterPaginationData = async ({
  create_new_arr = false,
  data,
  page,
  countRoute,
  data_to_send = {},
  state,
  user =undefined
}) => {

  let obj = {};

  let headers  = {};
  if(user){
    headers.headers ={
      'Authorization' : `Bearer ${user}`
    }
  }
  if (state != null && !create_new_arr && Array.isArray(state.results)) {
    obj = { ...state, results: [...state.results, ...data], page: page };
  } else {
    await axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}${countRoute}`, data_to_send, headers)
      .then(({ data: { totalDocs } }) => {
        obj = { results: data, page: 1, totalDocs };
      })
      .catch((err) => {
        console.log(err);
      });
    }
    return obj;
};

export default FilterPaginationData;
