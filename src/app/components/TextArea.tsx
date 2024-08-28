import TextField from "@mui/material/TextField";
import React from "react";
import { styled } from "@mui/material/styles";

const StyledTextField = styled(TextField)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
        "& fieldset": {
            borderColor: "#FFFFFF",
        },
        "&:hover fieldset": {
            borderColor: "#FFFFFF", // Cambiar el color del borde a blanco cuando está deshabilitado y se pasa el ratón
        },
        "&.Mui-focused fieldset": {
            borderColor: "#4285F4",
            borderWidth: "2px",
        },
        "& .MuiInputBase-input": {
            color: "#FFFFFF", // Color del texto
        },
    },
    "& .MuiInputLabel-root": {
        color: "#5F6368",
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: "#4285F4",
    },
    "& .Mui-disabled": {
        "& .MuiOutlinedInput-root": {
            backgroundColor: "#DADCE0", // Color de fondo deshabilitado similar a los botones de Google
            boxShadow: "none",
            borderColor: "#DADCE0", // Color del borde cuando está deshabilitado
        },
        "& .MuiInputBase-input": {
            color: "#5F6368", // Color del texto cuando está deshabilitado
        },
        "& .MuiInputLabel-root": {
            color: "#5F6368", // Color de la etiqueta cuando está deshabilitada
        },
        // Asegurarse de que el borde no cambie cuando se pasa el ratón
        "&:hover fieldset": {
            borderColor: "#171e29", // Cambiar el color del borde a blanco cuando está deshabilitado y se pasa el ratón
        },
    },
}));

interface TextAreaProps {
    text: string;
    onTextChange: (text: string) => void;
    onPaste?: (text: string) => void;
    disabled?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({
    text,
    disabled,
    onTextChange,
    onPaste,
}) => {
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
            disabled={disabled}
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
