
import { infinity } from 'ldrs';

infinity.register()
const LoadingElement = () => {
    return (
      <div className="flex justify-center items-center h-screen">
        <l-infinity
    size="55"
    stroke="4"
    stroke-length="0.15"
    bg-opacity="0.1"
    speed="1.3" 
    color="#003068" 
  ></l-infinity>
      </div>
    );
  };
  export default LoadingElement;