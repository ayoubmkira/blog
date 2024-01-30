
document.addEventListener("DOMContentLoaded", () => {

    const formAddNewTag = document.getElementById("form_add_new_tag");
    const tagMessage = document.getElementById("tag_message");
    const boxTagsList = document.getElementById("ks-cboxtags-list");
    const myModal = new bootstrap.Modal(document.getElementById('modalNewtag'));

    const showMessage = (type, message) => {
        tagMessage.classList.remove("alert-success");
        tagMessage.classList.remove("alert-danger");
        tagMessage.classList.add("d-none");

        if(message) {
            tagMessage.classList.remove("d-none");
            if(type === "error") {
                tagMessage.classList.add("alert-danger");
                tagMessage.innerText = message;
            } else {
                tagMessage.classList.add("alert-success");
                tagMessage.innerText = message;
            }
        }
    };

    /*
        :: OLD CODE
    */
    /*
    formAddNewTag.addEventListener("submit", async (e) => {
        e.preventDefault();
    
        // const formData = new FormData(e.target);
        const data = {
            tag: {
                name: formAddNewTag.elements["name"].value
            }
        };

        await fetch(`/tags`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        })
        .then(async (response) => {
            if(!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            return response.json();
        })
        .then(async (data) => {
            // Show success Message:
            showMessage("success", data.message);

            // Add New Added Tag in List of Tags:
            const newTag = data.tag;
            const newTagElm = document.createElement(`div`);
            newTagElm.innerHTML = `
                <input type="checkbox" id="checkbox_${ newTag.name }" value="Rarity" checked>
                <label for="checkbox_${ newTag.name }" class="border fs-7">${ newTag.name }</label>
            `;
            boxTagsList.appendChild(newTagElm);
        })
        .catch((error) => {
            showMessage("error", error.message);
        });

    });
    */

    // [tags] imported from ejs Template:
    tags = tags.map((tagObj) => tagObj.name.toLowerCase());

    formAddNewTag.addEventListener("submit", (e) => {
        e.preventDefault();

        const tagName = formAddNewTag.elements["name"].value.trim().toLowerCase();

        if(tags.includes(tagName)) {
            showMessage("error", "Tag name already exists!");
            return;
        }

        tags.push(tagName);

        // Create new Dom tag name:
        const newTagElm = document.createElement(`div`);
        newTagElm.innerHTML = `
            <input type="checkbox" id="checkbox_${ tagName }" name="post[tags][]" value="${ tagName }" checked>
            <label for="checkbox_${ tagName }" class="border fs-7">${ tagName }</label>
        `;
        boxTagsList.appendChild(newTagElm);
        showMessage("success", "Tag name added successfully.");

        setTimeout(() => {
            myModal.hide();
            showMessage("", "");
            formAddNewTag.reset();
        }, 350);

    });

    

});