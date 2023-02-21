import SpeedIcon from '@mui/icons-material/Speed';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import {ClassDemandLevel} from "../../types/derivedTypes";


const ClassDemandMeter = ({demandLevel}: {demandLevel: ClassDemandLevel}) => {
    switch (demandLevel) {
        case ClassDemandLevel.High:
            return <SpeedIcon style={{color: "red"}}/>;
        case ClassDemandLevel.Medium:
            return <SpeedIcon style={{color: "orange"}}/>;
        case ClassDemandLevel.Low:
            return <SpeedIcon style={{color: "green"}}/>;
        default:
            return <QuestionMarkIcon/>
    }
}

export default ClassDemandMeter;
