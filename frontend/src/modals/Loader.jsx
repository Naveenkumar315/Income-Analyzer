import React from "react";
import { DNA } from "react-loader-spinner";

const Loader = () => {
    return (
        <div className="flex items-center justify-center h-full w-full">
            <DNA
                visible={true}
                height="80"
                width="80"
                ariaLabel="dna-loading"
                wrapperClass="dna-wrapper"
            />
        </div>
    );
};

export default Loader;
