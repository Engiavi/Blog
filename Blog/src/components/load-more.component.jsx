<<<<<<< HEAD
const LoadMoreData = ({state,fetchData}) => {
=======
const LoadMoreData = ({state,fetchData,additionalParam}) => {
>>>>>>> master

    if(state != null && state.totalDocs > state.results.length){
  return (
   <button 
<<<<<<< HEAD
   onClick={()=>fetchData({page:state.page+1})}
=======
   onClick={()=>fetchData({...additionalParam,page:state.page+1})}
>>>>>>> master
   className='p-2 px-3 bg-black text-white rounded-full flex items-center gap-2 '
   >
    Load More
   </button>
  )
    }
  
}

export default LoadMoreData;