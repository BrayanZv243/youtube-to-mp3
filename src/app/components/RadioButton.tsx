import React from "react";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

interface RadioButtonOption {
    value: string;
    label: string;
}

interface RadioButtonProps {
    selectedValue?: string;
    className?: string;
    title?: string;
    disabled?: boolean;
    options: RadioButtonOption[];
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioButton = ({
    className,
    selectedValue,
    disabled,
    title = "",
    options,
    onChange,
}: RadioButtonProps) => {
    return (
        <div className={className}>
            <FormControl component="fieldset">
                <RadioGroup value={selectedValue} onChange={onChange}>
                    <FormLabel component="legend">{title}</FormLabel>
                    <div className="grid grid-cols-2 gap-2 text-start">
                        {options.map((option) => (
                            <FormControlLabel
                                className="max-w-40 break-words"
                                key={option.value}
                                value={option.value}
                                control={<Radio />}
                                label={option.label}
                                disabled={disabled}
                            />
                        ))}
                    </div>
                </RadioGroup>
            </FormControl>
        </div>
    );
};

export default RadioButton;
