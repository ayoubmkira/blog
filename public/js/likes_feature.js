
document.addEventListener("DOMContentLoaded", () => {

    const btnLikeElm = document.getElementById("btn-like");

    btnLikeElm.addEventListener("click", async () => {
        // Change the UI State of the button:
        if(btnLikeElm.classList.contains("btn-white")) {
            btnLikeElm.classList.remove("btn-white");
            btnLikeElm.classList.add("btn-danger");
        } else {
            btnLikeElm.classList.add("btn-white");
            btnLikeElm.classList.remove("btn-danger");
        }

        await fetch(`/posts/${postId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            }
        })
        // .then((response) => response.json())
        // .then(message => console.log(message))
        .catch(error => console.log(error));

    });

});