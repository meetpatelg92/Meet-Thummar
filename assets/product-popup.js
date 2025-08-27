window.addEventListener('DOMContentLoaded', () => {
    // open popup on clicking the button
    const popupBtn = document.querySelectorAll('[data-open-popup]');
    const closeBtn = document.querySelectorAll('[data-close-popup]');
    const popupElements = document.querySelectorAll('.product_popup');
    if(popupBtn.length) {
        popupBtn.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const popupId = e.currentTarget.getAttribute('data-open-popup');
                const popupEl = e.currentTarget.closest('.single-product').querySelector(`[data-popup="${popupId}"]`);
                console.log('Popup ID:', popupEl);
                popupEl.classList.add('active_popup');
                document.body.classList.add('no-scroll');
            });
        });
    }

    // close popup on clicking close button
    if(closeBtn.length) {
        closeBtn.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const popupEl = e.currentTarget.closest('.product_popup');
                popupEl.classList.remove('active_popup');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    if(popupElements.length) {
        popupElements.forEach((popup) => {
            // close popup on clicking outside the content area
            popup.addEventListener('click', (e) => {
                if(e.target === popup) {
                    popup.classList.remove('active_popup');
                    document.body.classList.remove('no-scroll');
                }
            });

            // choose size toggle
            const sizeToggle = popup.querySelector('.select_size-block');
            sizeToggle.addEventListener('click', (e) => {
                sizeToggle.nextElementSibling.classList.toggle('active_size-list');
            })
        });
    }

    // options selection and variant matching 
    let selectedOptions = {};

    const optionsValues = document.querySelectorAll('.product_variant--options .option_value');
    // handle clicks on option values
    if(optionsValues.length){
        optionsValues.forEach(option => {
            option.addEventListener("click", function (e) {
              // add the size name in dropdown 
              if(e.currentTarget.closest('.options_values_list')){
                  e.currentTarget.closest('.options_values').querySelector('.select_size-block p.choose_size').innerText = e.currentTarget.dataset.value;
                  e.currentTarget.closest('.options_values_list').classList.remove('active_size-list');
              }
              // find which option group this belongs to (option1 / option2 / option3)
              let optionKey = e.currentTarget.closest(".option_block").dataset.option;
              let optionValue = e.currentTarget.dataset.value;
        
              // store/update the selection
              selectedOptions[optionKey] = optionValue;
              console.log(selectedOptions);
      
              const productVariant = e.currentTarget.closest('.product_popup').querySelector("[id^='popup-product-variants']");
              console.log(productVariant);
              const variants = JSON.parse(productVariant.innerHTML);
              console.log(variants);
      
              // try to find matching variant
              let matchedVariant = variants.find(v => {
                  return (!selectedOptions.option1 || v.option1 === selectedOptions.option1) &&
                      (!selectedOptions.option2 || v.option2 === selectedOptions.option2) &&
                      (!selectedOptions.option3 || v.option3 === selectedOptions.option3);
              });
      
              if (matchedVariant) {
                  console.log("Selected Variant:", matchedVariant.title, "→ ID:", matchedVariant.id);
                  const variantIdInput = e.currentTarget.closest('.product_popup').querySelector("[data-popup-variant-id]");
                  variantIdInput.value = matchedVariant.id;
              }
            });
        });
    }

    // add to cart form submission
    const atcForms = document.querySelectorAll('.product_popup form');
    if(atcForms.length) {
        atcForms.forEach((form) => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                console.log(...formData);
                const variantId = formData.get('id');
                fetch('/cart/add.js', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw err; });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Item added to cart:', data);

                    // Optionally, update cart UI or show a success message
                    const popupEl = form.closest('.product_popup');
                    popupEl.classList.remove('active_popup');
                    document.body.classList.remove('no-scroll');

                    alert('Item added to cart successfully!'); 
                
                })
                .catch(error => {
                    console.error('Error adding to cart:', error);
                    alert(error.description || 'There was an error adding the item to the cart.');
                })
            });
        });
    }
})