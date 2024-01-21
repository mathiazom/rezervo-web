import { Box, Checkbox, FormControl, FormControlLabel, FormGroup } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import { CATEGORIES_COLOR } from "@/components/modals/ScheduleFiltersDialog";
import { storeSelectedCategories } from "@/lib/helpers/storage";
import { RezervoChain } from "@/types/chain";

export default function CategoryFilters({
    chain,
    allCategories,
    selectedCategories,
    setSelectedCategories,
}: {
    chain: RezervoChain;
    allCategories: string[];
    selectedCategories: string[];
    setSelectedCategories: Dispatch<SetStateAction<string[]>>;
}) {
    const allChecked = allCategories.every((category) => selectedCategories.includes(category));
    const allIndeterminate = !allChecked && allCategories.some((category) => selectedCategories.includes(category));

    return (
        <Box px={2} sx={{ display: "flex", alignItems: "flex-start" }}>
            {/*<Avatar sx={{ bgcolor: CATEGORIES_COLOR[500] }}>*/}
            {/*    <CategoryIcon fontSize="small" />*/}
            {/*</Avatar>*/}
            <FormControl sx={{ mx: 3 }} component="fieldset" variant="standard">
                <FormGroup sx={{ mt: 1 }}>
                    <>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={allChecked}
                                    indeterminate={allIndeterminate}
                                    onChange={({ target: { checked } }) =>
                                        setSelectedCategories(() => {
                                            const newSelection = checked ? allCategories : [];
                                            storeSelectedCategories(chain.profile.identifier, newSelection);
                                            return newSelection;
                                        })
                                    }
                                    value={"Alle"}
                                    sx={{
                                        color: CATEGORIES_COLOR[800],
                                        "&.Mui-checked": {
                                            color: CATEGORIES_COLOR[600],
                                        },
                                        "&.MuiCheckbox-indeterminate": {
                                            color: CATEGORIES_COLOR[600],
                                        },
                                    }}
                                />
                            }
                            label={"Alle"}
                        />
                        {allCategories.map((category) => (
                            <FormControlLabel
                                key={category}
                                sx={{ ml: 3 }}
                                control={
                                    <Checkbox
                                        checked={selectedCategories.includes(category)}
                                        onChange={({ target: { checked } }) =>
                                            setSelectedCategories((selected) => {
                                                const newSelection = checked
                                                    ? [...selected, category]
                                                    : selected.filter((id) => id !== category);
                                                storeSelectedCategories(chain.profile.identifier, newSelection);
                                                return newSelection;
                                            })
                                        }
                                        value={category}
                                        sx={{
                                            color: CATEGORIES_COLOR[800],
                                            "&.Mui-checked": {
                                                color: CATEGORIES_COLOR[600],
                                            },
                                        }}
                                    />
                                }
                                label={category}
                            />
                        ))}
                    </>
                </FormGroup>
            </FormControl>
        </Box>
    );
}
