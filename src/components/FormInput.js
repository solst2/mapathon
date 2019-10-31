import React from "react";

export function FormInput({
                              type,
                              name,
                              placeholder,
                              value,
                              onChange,
                              fieldRef
                          }) {
    return (
        <>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                required
                value={value}
                onChange={onChange}
                ref={fieldRef}
            />
            <br />
        </>
    );
}