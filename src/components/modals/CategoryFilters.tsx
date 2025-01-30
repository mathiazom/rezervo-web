import { Box, Checkbox, FormControl, FormControlLabel, FormGroup } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

import { CATEGORIES_COLOR } from "@/components/modals/ScheduleFiltersDialog";
import { storeSelectedCategories } from "@/lib/helpers/storage";
import { ActivityCategory, RezervoChain } from "@/types/chain";

export default function CategoryFilters({
    chain,
    allCategories,
    selectedCategories,
    setSelectedCategories,
}: {
    chain: RezervoChain;
    allCategories: ActivityCategory[];
    selectedCategories: string[];
    setSelectedCategories: Dispatch<SetStateAction<string[]>>;
}) {
    const allChecked = allCategories.every((category) => selectedCategories.includes(category.name));
    const allIndeterminate =
        !allChecked && allCategories.some((category) => selectedCategories.includes(category.name));

    return (
        <Box
            sx={{
                px: { xs: 0.5, sm: 2 },
                display: "flex",
                alignItems: "flex-start",
            }}
        >
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
                                            const newSelection = checked ? allCategories.map((ac) => ac.name) : [];
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
                                key={category.name}
                                sx={{ ml: 3 }}
                                control={
                                    <Checkbox
                                        checked={selectedCategories.includes(category.name)}
                                        onChange={({ target: { checked } }) =>
                                            setSelectedCategories((selected) => {
                                                const newSelection = checked
                                                    ? [...selected, category.name]
                                                    : selected.filter((id) => id !== category.name);
                                                storeSelectedCategories(chain.profile.identifier, newSelection);
                                                return newSelection;
                                            })
                                        }
                                        value={category.name}
                                        sx={{
                                            color: CATEGORIES_COLOR[800],
                                            "&.Mui-checked": {
                                                color: CATEGORIES_COLOR[600],
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", whiteSpace: "nowrap" }}>
                                        {category.name}
                                        <Box
                                            sx={{
                                                borderRadius: "50%",
                                                height: ".8rem",
                                                width: ".8rem",
                                                backgroundColor: category.color,
                                                flexShrink: 0,
                                            }}
                                        />
                                    </Box>
                                }
                            />
                        ))}
                    </>
                </FormGroup>
            </FormControl>
        </Box>
    );
}
