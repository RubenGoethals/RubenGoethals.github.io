const handleEventListener = function (domLabel, domInput) {
  if (domInput.value.length == 0) {
    // Remove class
    domLabel.classList.remove("is-floating");
  } else {
    //Add class
    domLabel.classList.add("is-floating");
  }
};
const handleFloatingLabel = function () {
  let domFloatingLabelInputs = document.querySelectorAll(".js-label");
  let dominputInputs = document.querySelectorAll(".js-input");

  for (let i = 0; i < dominputInputs.length; ++i) {
    result = dominputInputs[i];
    result.addEventListener("blur", function () {
      handleEventListener(domFloatingLabelInputs[i], dominputInputs[i]);
    });
  }
};

const init = () => {
  handleFloatingLabel();
}

document.addEventListener("DOMContentLoaded", init);
