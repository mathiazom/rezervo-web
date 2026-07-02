import { Box, Checkbox, FormControl, FormControlLabel, FormGroup } from "@mui/material";
import { Fragment } from "react";

import { LOCATIONS_COLOR } from "@/components/schedule/filter/ScheduleFiltersDialog";
import { RezervoChain } from "@/types/openapi";

export default function LocationFilters({
    chain,
    selectedLocationIds,
    setSelectedLocationIds,
}: {
    chain: RezervoChain;
    selectedLocationIds: string[];
    setSelectedLocationIds: (value: string[]) => void;
}) {
    const allLocationIds = chain.branches.flatMap((branch) => branch.locations.map(({ identifier }) => identifier));
    const allChecked = chain.branches.every((branch) =>
        branch.locations.every(({ identifier }) => selectedLocationIds.includes(identifier)),
    );
    const allIndeterminate =
        !allChecked &&
        chain.branches.some((branch) =>
            branch.locations.some(({ identifier }) => selectedLocationIds.includes(identifier)),
        );

    return (
        <Box sx={{ px: { xs: 0.5, sm: 2 }, display: "flex", alignItems: "flex-start" }}>
            <FormControl sx={{ mx: 3 }} component="fieldset" variant="standard">
                <FormGroup sx={{ mt: 1 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={allChecked}
                                indeterminate={allIndeterminate}
                                onChange={({ target: { checked } }) =>
                                    setSelectedLocationIds(checked ? allLocationIds : [])
                                }
                                value={"Alle"}
                                sx={{
                                    color: LOCATIONS_COLOR[800],
                                    "&.Mui-checked": {
                                        color: LOCATIONS_COLOR[600],
                                    },
                                    "&.MuiCheckbox-indeterminate": {
                                        color: LOCATIONS_COLOR[600],
                                    },
                                }}
                            />
                        }
                        label={"Alle"}
                    />
                    {chain.branches.map((branch) => {
                        const branchChecked = branch.locations.every(({ identifier }) =>
                            selectedLocationIds.includes(identifier),
                        );
                        const indeterminate =
                            !branchChecked &&
                            branch.locations.some(({ identifier }) => selectedLocationIds.includes(identifier));
                        const locationIds = branch.locations.map(({ identifier }) => identifier);
                        return (
                            <Fragment key={branch.identifier}>
                                <FormControlLabel
                                    sx={{ ml: 3 }}
                                    control={
                                        <Checkbox
                                            checked={branchChecked}
                                            indeterminate={indeterminate}
                                            onChange={({ target: { checked } }) =>
                                                setSelectedLocationIds(
                                                    checked
                                                        ? [
                                                              ...selectedLocationIds,
                                                              ...branch.locations.map(({ identifier }) => identifier),
                                                          ]
                                                        : selectedLocationIds.filter((id) => !locationIds.includes(id)),
                                                )
                                            }
                                            value={branch.identifier}
                                            sx={{
                                                color: LOCATIONS_COLOR[800],
                                                "&.Mui-checked": {
                                                    color: LOCATIONS_COLOR[600],
                                                },
                                                "&.MuiCheckbox-indeterminate": {
                                                    color: LOCATIONS_COLOR[600],
                                                },
                                            }}
                                        />
                                    }
                                    label={branch.name}
                                />
                                {branch.locations.length > 1 &&
                                    branch.locations.map(({ identifier, name }) => (
                                        <FormControlLabel
                                            key={identifier}
                                            sx={{ ml: 6 }}
                                            control={
                                                <Checkbox
                                                    checked={selectedLocationIds.includes(identifier)}
                                                    onChange={({ target: { checked } }) =>
                                                        setSelectedLocationIds(
                                                            checked
                                                                ? [...selectedLocationIds, identifier]
                                                                : selectedLocationIds.filter((id) => id !== identifier),
                                                        )
                                                    }
                                                    value={identifier}
                                                    sx={{
                                                        color: LOCATIONS_COLOR[800],
                                                        "&.Mui-checked": {
                                                            color: LOCATIONS_COLOR[600],
                                                        },
                                                    }}
                                                />
                                            }
                                            label={name}
                                        />
                                    ))}
                            </Fragment>
                        );
                    })}
                </FormGroup>
            </FormControl>
        </Box>
    );
}
