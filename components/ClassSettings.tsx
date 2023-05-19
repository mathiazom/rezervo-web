export default function ClassSettings() {
    return (
        <>
            {/*<Modal*/}
            {/*    open={settingsClass != null}*/}
            {/*    onClose={() => setSettingsClass(null)}*/}
            {/*>*/}
            {/*    <>*/}
            {/*        {settingsClass && (*/}
            {/*            <Box*/}
            {/*                sx={{*/}
            {/*                    position: "absolute",*/}
            {/*                    top: "50%",*/}
            {/*                    left: "50%",*/}
            {/*                    width: "95%",*/}
            {/*                    maxHeight: "80%",*/}
            {/*                    overflowY: "scroll",*/}
            {/*                    maxWidth: 600,*/}
            {/*                    transform: "translate(-50%, -50%)",*/}
            {/*                    backgroundColor:*/}
            {/*                        theme.palette.mode === "dark"*/}
            {/*                            ? "#111"*/}
            {/*                            : "white",*/}
            {/*                    borderRadius: "0.25em",*/}
            {/*                    boxShadow: 24,*/}
            {/*                    p: 4,*/}
            {/*                }}*/}
            {/*            >*/}
            {/*                <Box*/}
            {/*                    sx={{*/}
            {/*                        display: "flex",*/}
            {/*                        alignItems: "center",*/}
            {/*                        gap: 1,*/}
            {/*                        paddingBottom: 1,*/}
            {/*                    }}*/}
            {/*                >*/}
            {/*                    <Box*/}
            {/*                        sx={{*/}
            {/*                            backgroundColor:*/}
            {/*                                colorForClass(settingsClass),*/}
            {/*                            borderRadius: "50%",*/}
            {/*                            height: "1.5rem",*/}
            {/*                            width: "1.5rem",*/}
            {/*                        }}*/}
            {/*                    />*/}
            {/*                    <Typography variant="h6" component="h2">*/}
            {/*                        {settingsClass.name}*/}
            {/*                    </Typography>*/}
            {/*                    <IconButton*/}
            {/*                        onClick={() => {*/}
            {/*                            setSettingsClass(null);*/}
            {/*                            setModalClass(settingsClass);*/}
            {/*                        }}*/}
            {/*                        size={"small"}*/}
            {/*                    >*/}
            {/*                        <InfoOutlinedIcon />*/}
            {/*                    </IconButton>*/}
            {/*                </Box>*/}
            {/*                <Box sx={{ display: "flex" }}>*/}
            {/*                    <Typography*/}
            {/*                        variant="body2"*/}
            {/*                        color="text.secondary"*/}
            {/*                    >*/}
            {/*                        {`${simpleTimeStringFromISO(*/}
            {/*                            settingsClass.from*/}
            {/*                        )} - ${simpleTimeStringFromISO(*/}
            {/*                            settingsClass.to*/}
            {/*                        )} */}
            {/*                            / ${settingsClass.studio.name} */}
            {/*                            / ${settingsClass.instructors*/}
            {/*                            .map((i) => i.name)*/}
            {/*                            .join(", ")}`}*/}
            {/*                    </Typography>*/}
            {/*                </Box>*/}
            {/*                <Box pt={6} pb={4}>*/}
            {/*                    <TextField*/}
            {/*                        fullWidth*/}
            {/*                        label={"Gjentakelse"}*/}
            {/*                        defaultValue={"hver uke"}*/}
            {/*                        value={recurrency}*/}
            {/*                        onChange={(*/}
            {/*                            event: React.ChangeEvent<HTMLInputElement>*/}
            {/*                        ) => {*/}
            {/*                            setRecurrency(event.target.value);*/}
            {/*                        }}*/}
            {/*                        // error={recurrency !== "hver uke"}*/}
            {/*                    />*/}
            {/*                </Box>*/}
            {/*            </Box>*/}
            {/*        )}*/}
            {/*    </>*/}
            {/*</Modal>*/}
        </>
    );
}
