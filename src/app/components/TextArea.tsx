import TextField from "@mui/material/TextField";
import React from "react";
import { styled } from "@mui/material/styles";

const StyledTextField = styled(TextField)({
    "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
        "& fieldset": {
            borderColor: "#DADCE0",
        },
        "&:hover fieldset": {
            borderColor: "#4285F4",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#4285F4",
            borderWidth: "2px",
        },
        "& .MuiInputBase-input": {
            color: "#FFFFFF", // Color gris para el texto
        },
    },
    "& .MuiInputLabel-root": {
        color: "#5F6368",
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: "#4285F4",
    },
});

interface TextAreaProps {
    text: string;
    onTextChange: (text: string) => void;
    onPaste?: (text: string) => void;
}

const TextArea: React.FC<TextAreaProps> = ({ text, onTextChange, onPaste }) => {
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onTextChange(event.target.value);
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const clipboardData = event.clipboardData.getData("text");
        if (onPaste) {
            event.preventDefault();
            onPaste(clipboardData);
        }
    };

    return (
        <StyledTextField
            label="Pega aquí todas las canciones!"
            multiline
            value={text}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            minRows={4}
            sx={{
                textarea: {
                    resize: "none",
                },
                "& .MuiInputBase-input": {
                    overflow: "hidden",
                },
                width: "500px",
            }}
            slotProps={{
                htmlInput: {
                    onPaste: handlePaste,
                },
            }}
        />
    );
};

export default TextArea;
