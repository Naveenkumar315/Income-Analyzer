import Button from "../components/Button";

const UnuploadedScreen = ({ setShowSection }) => {
  return (
    <div
      className="h-full flex flex-col items-center justify-center text-center"
      style={{ margin: "auto" }}
    >
      <p className="text-gray-500 mb-4">
        No documents yet, Upload to start extracting
      </p>
      <Button
        variant="upload-doc"
        width={200}
        label={"Upload Documents"}
        onClick={() =>
          setShowSection((prev) => ({ ...prev, uploadedModel: true }))
        }
      />
    </div>
  );
};

export default UnuploadedScreen;
