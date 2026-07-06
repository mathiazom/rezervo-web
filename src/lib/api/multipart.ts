// OpenAPI types a binary-format file field as `string`, since it has no native representation for `File`;
// the real `File` is sent as multipart/form-data via a custom `bodySerializer` instead of the typed `body`.
export function fileUploadRequestInit<Field extends string>(field: Field, file: File) {
    return {
        body: { [field]: file } as unknown as Record<Field, string>,
        bodySerializer: () => {
            const formData = new FormData();
            formData.append(field, file);
            return formData;
        },
    };
}
