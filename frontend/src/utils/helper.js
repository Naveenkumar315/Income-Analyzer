export const transformObjectToArray = (obj) => {
  try {
    return Object.entries(obj).map(([key, value]) => ({
      [key]: value,
    }));
  } catch (ex) {
    console.log("Error in transfromObjectToArray", ex);
  }
};
