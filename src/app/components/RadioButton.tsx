import React, { useState } from "react";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

interface RadioButtonProps {
    selectedValue?: string;
    className?: string;
    disabled?: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioButton = ({
    className,
    selectedValue,
    disabled,
    onChange,
}: RadioButtonProps) => {
    return (
        <div className={className}>
            <FormControl component="fieldset">
                <FormLabel component="legend">
                    Selecciona el tipo de pegado
                </FormLabel>
                <RadioGroup value={selectedValue} onChange={onChange}>
                    <FormControlLabel
                        value="whatsapp"
                        control={<Radio />}
                        label="WhatsApp"
                        disabled={disabled}
                    />
                    <FormControlLabel
                        value="youtube"
                        control={<Radio />}
                        label="YouTube"
                        disabled={disabled}
                    />
                </RadioGroup>
            </FormControl>
        </div>
    );
};

export default RadioButton;
