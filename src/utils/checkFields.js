 const checkMissingFields = (body, requiredFields) => {
  const missingFields = [];

  requiredFields.forEach((field) => {
    if (typeof field === "string") {
      // Check if the field is missing or empty
      if (
        !body[field] ||
        (typeof body[field] === "string" && body[field].trim() === "")
      ) {
        missingFields.push(field);
      }
    } else if (typeof field === "object" && field.name && field.nested) {
      // Check nested fields
      const nestedFieldValue = body[field.name];
      if (!nestedFieldValue || typeof nestedFieldValue !== "object") {
        missingFields.push(field.name);
      } else {
        const nestedMissingFields = checkMissingFields(
          nestedFieldValue,
          field.nested
        );
        if (nestedMissingFields.length > 0) {
          nestedMissingFields.forEach((nestedField) => {
            missingFields.push(`${field.name}.${nestedField}`);
          });
        }
      }
    }
  });

  return missingFields;
};

module.exports={checkMissingFields}
