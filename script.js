let currentIndex = 0;
const cards = document.querySelectorAll('.tariff');

// Функции для переключения тарифов (без изменений)
function showCard(index) {
    const isMobile = window.innerWidth <= 768;
    const cardsToShow = isMobile ? 1 : 3;

    cards.forEach((card, i) => {
        if (i >= index && i < index + cardsToShow) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

function nextCard() {
    const isMobile = window.innerWidth <= 768;
    const cardsToShow = isMobile ? 1 : 3;

    if (currentIndex + cardsToShow < cards.length) {
        currentIndex += 1;
        showCard(currentIndex);
    }
}

function prevCard() {
    if (currentIndex > 0) {
        currentIndex -= 1;
        showCard(currentIndex);
    }
}

function selectTariff(tariff, discount, description, isMainTariff = true) {
    const mainTariffInput = document.getElementById("main-tariff");
    const tariffInput = document.getElementById("tariff");
    
    if (isMainTariff) {
        mainTariffInput.value = `${tariff} - ${discount} (${description})`;
        
        // Обновляем поле с услугами
        if (tariffInput.value.includes("Видеонаблюдение")) {
            tariffInput.value = `${mainTariffInput.value} + Видеонаблюдение`;
        } else {
            tariffInput.value = mainTariffInput.value;
        }
    } else {
        // Блокировка выбора только видеонаблюдения
        if (!mainTariffInput.value) {
            alert("Для добавления видеонаблюдения сначала выберите основной тариф!");
            return;
        }
        tariffInput.value = `${mainTariffInput.value} + ${tariff} - ${discount} (${description})`;
    }

    if (window.innerWidth <= 768) {
        document.getElementById("application-form").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

// Функция отправки формы (полная версия)
async function submitForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const phoneInput = document.getElementById("phone");
    const mainTariff = document.getElementById("main-tariff").value;
    
    // Жёсткая проверка основного тарифа
    if (!mainTariff) {
        alert('Пожалуйста, выберите основной тариф!');
        return false;
    }
    
    // Валидация телефона
    if (!/^[\d\+]{10,15}$/.test(phoneInput.value)) {
        alert('Некорректный номер телефона. Введите минимум 10 цифр.');
        phoneInput.focus();
        return false;
    }

    // Блокировка кнопки
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
    }

    const formData = {
        tariff: document.getElementById("tariff").value,
        main_tariff: mainTariff,
        address: document.getElementById("address").value,
        name: document.getElementById("name").value,
        phone: phoneInput.value,
        date: new Date().toLocaleString()
    };

    // Отправка через GAS (с реальным URL)
    try {
        const GAS_URL = "https://script.google.com/macros/s/AKfycbxVXWpL5p0Bt9-pEzcTUcnybKa1eKzcLMfSK_te4zFV3UhY-krE0G0-XO_4g9s1IENybw/exec";
        
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error("Ошибка сервера");
        showSuccess();
    } catch (error) {
        console.error("Ошибка:", error);
        showError();
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Подключить';
        }
    }
}

// Остальные функции без изменений
function showSuccess() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.display = 'none';
            resetForm();
        }, 5000);
    }
}

function showError() {
    alert("Ошибка соединения. Позвоните нам: +7 (991) 424-23-37");
}

function resetForm() {
    // Сброс только полей формы, кроме выбранных услуг
    document.getElementById("address").value = "";
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
}

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('successModal').style.display = 'none';
});

showCard(currentIndex);
