import { ColorRing } from "react-loader-spinner";

const Loading = () => {
    return (

        <ColorRing
            visible={true}
            height="80"
            width="80"
            colors={['#4BC500',"#4BC500","#4BC500","#4BC500","#4BC500"]}
        />
    )
}

export default Loading