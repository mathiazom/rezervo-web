import SpeedIcon from '@mui/icons-material/Speed';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import {ClassPopularity} from "../../types/derivedTypes";


const ClassPopularityMeter = ({popularity}: {popularity: ClassPopularity}) => {
    switch (popularity) {
        case ClassPopularity.High:
            return <SpeedIcon style={{color: "red"}}/>;
        case ClassPopularity.Medium:
            return <SpeedIcon style={{color: "orange"}}/>;
        case ClassPopularity.Low:
            return <SpeedIcon style={{color: "green"}}/>;
        default:
            return <QuestionMarkIcon/>
    }
}

export default ClassPopularityMeter;
