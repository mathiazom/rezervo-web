import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useRouter } from "next/router";

import IntegrationLogo from "@/TEMP/IntegrationLogo";

function SelectIntegration({ currentIntegrationAcronym }: { currentIntegrationAcronym: string }) {
    const router = useRouter();

    return (
        <FormControl size={"small"} variant={"outlined"}>
            <InputLabel sx={{ pl: "1.1rem" }} id={"select-integration-label"}>
                Velg senter
            </InputLabel>
            <Select
                variant={"outlined"}
                sx={{ marginX: 1.5 }}
                defaultValue={currentIntegrationAcronym}
                id="select-integration"
                label={"Velg senter"}
                labelId={"select-integration-label"}
                onChange={(event: SelectChangeEvent) => {
                    router.push(`/${event.target.value}`);
                }}
            >
                <MenuItem value={"sit"}>
                    <IntegrationLogo integrationAcronym={"sit"} />
                </MenuItem>
                <MenuItem value={"fsc"}>
                    <IntegrationLogo integrationAcronym={"fsc"} />
                </MenuItem>
            </Select>
        </FormControl>
    );
}

export default SelectIntegration;
