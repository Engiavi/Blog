const LoadMoreData = ({state,fetchData,additionalParam}) => {

    if(state != null && state.totalDocs > state.results.length){
  return (
   <button 
   onClick={()=>fetchData({...additionalParam,page:state.page+1})}
   className='p-2 px-3 bg-black text-white rounded-full flex items-center gap-2 '
   >
    Load More
   </button>
  )
    }
  
}

export default LoadMoreData;