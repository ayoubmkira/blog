
document.addEventListener("DOMContentLoaded", function () {

    const inputFileElm = document.getElementById("input-image");

    const checkFileTypeAndSize = () => {  
        const filePath = fileInput.value;

        // Check Numbers of Files:
        if(filePath.files.length > 1) {

        }

        // Not Completed .....

        // Allowing file type:
        const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i; 
        if (!allowedExtensions.exec(filePath)) { 
            inputFileElm.classList.add("is-invalid");
            fileInput.value = '';
            return;
        }
    };

    inputFileElm.addEventListener(() => {

    });

});