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
    let matchedVariant;

    const optionsValues = document.querySelectorAll('.product_variant--options .option_value');
    // handle clicks on option values
    if(optionsValues.length){
        optionsValues.forEach(option => {
            option.addEventListener("click", function (e) {
              // add the size name in dropdown 
              if(e.currentTarget.closest('.options_values_list')){
                  e.currentTarget.closest('.options_values').querySelector('.select_size-block p.choose_size').innerText = e.currentTarget.dataset.value;
                  e.currentTarget.closest('.options_values').querySelector('.select_size-block p.choose_size').classList.add('selected');
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
            matchedVariant = variants.find(v => {
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
                const colorOptions = e.currentTarget.closest('.product_popup').querySelectorAll('.option_colors input[type="radio"]');
                const sizeOptions = e.currentTarget.closest('.product_popup').querySelector('.choose_size');

                if(sizeOptions.classList.contains('selected') && Array.from(colorOptions).some(radio => radio.checked)) {
                    e.currentTarget.closest('.product_popup').querySelector('.select_options-error-msg').classList.add('hidden');
                } else {
                    e.currentTarget.closest('.product_popup').querySelector('.select_options-error-msg').classList.remove('hidden');
                    return;
                }

                // check if any product has medium and black selected then soft winter jacket also should add automatically
                let finalData = {
                    items: []
                };
                const formData = new FormData(form);
                const variantId = formData.get('id');
                if(matchedVariant.options.includes('M') && matchedVariant.options.includes('Black')) {
                    finalData.items.push(
                        {
                          id: variantId,
                          quantity: 1
                        },
                        {
                          id: e.currentTarget.closest('.popup_atc').getAttribute('data-extra-addOn-id'), // extra addon product variant ID
                          quantity: 1
                        }
                    );
                } else {
                    finalData.items.push({
                        id: variantId,
                        quantity: 1
                    });
                }
             
                // add to cart call
                fetch('/cart/add.js', {
                    method: 'POST',
                    body: JSON.stringify(finalData),
                    headers: {
                       'Content-Type': 'application/json',
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
                    // Update UI or notify user
                    const popupEl = form.closest('.product_popup');
                    popupEl.classList.remove('active_popup');
                    document.body.classList.remove('no-scroll');    

                    // for user to know which item added to cart and redirect to cart page
                    const titles = data.items.map(item => item.title); // collect titles
                    alert(`Added to cart: ${titles.join("\n")}`); 
                    window.open('/cart', '_blank');
                
                })
                .catch(error => {
                    console.error('Cart error', error);
                    alert(error.description || 'Error in adding product in cart.');
                })
            });
        });
    }
})