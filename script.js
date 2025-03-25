let currentIndex = 0;
const cards = document.querySelectorAll('.tariff');

// Функции для переключения тарифов
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
        
        const currentValue = tariffInput.value;
        if (currentValue.includes("Видеонаблюдение")) {
            tariffInput.value = `${tariff} - ${discount} (${description}) + Видеонаблюдение`;
        } else {
            tariffInput.value = `${tariff} - ${discount} (${description})`;
        }
    } else {
        const mainTariff = mainTariffInput.value;
        if (!mainTariff) {
            alert("Пожалуйста, сначала выберите основной тариф!");
            return;
        }
        tariffInput.value = `${mainTariff} + ${tariff} - ${discount} (${description})`;
    }

    if (window.innerWidth <= 768) {
        const formSection = document.getElementById("application-form");
        formSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

// Основная функция отправки формы
async function submitForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const phoneInput = document.getElementById("phone");
    const mainTariff = document.getElementById("main-tariff").value;
    const tariffInput = document.getElementById("tariff").value;
    
    // Проверка основного тарифа
    if (!mainTariff && tariffInput.includes("Видеонаблюдение")) {
        alert('Пожалуйста, выберите основной тариф!');
        return false;
    }
    
    // Валидация телефона
    if (!/^[\d\+]{10,15}$/.test(phoneInput.value)) {
        alert('Пожалуйста, введите корректный номер телефона (минимум 10 цифр)');
        phoneInput.focus();
        return false;
    }

    // Блокируем кнопку отправки
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
    }

    const formData = {
        tariff: document.getElementById("tariff").value,
        main_tariff: document.getElementById("main-tariff").value,
        address: document.getElementById("address").value,
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        date: new Date().toLocaleString()
    };

    // Отправка через GAS
    try {
        await sendToGoogleAppsScript(formData);
        showSuccess();
    } catch (error) {
        console.error("Ошибка отправки:", error);
        showError();
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Подключить';
        }
    }
}

// Отправка в Google Apps Script
async function sendToGoogleAppsScript(formData) {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbxVXWpL5p0Bt9-pEzcTUcnybKa1eKzcLMfSK_te4zFV3UhY-krE0G0-XO_4g9s1IENybw/exec";
    
    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // Всегда считаем успехом, если ответ получен
        if (!response.ok) {
            throw new Error("Ошибка сервера");
        }
    } catch (error) {
        console.error("Ошибка GAS:", error);
        throw error;
    }
}

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
    alert("Не удалось отправить заявку автоматически. Пожалуйста, позвоните нам напрямую по номеру +7 (991) 424-23-37");
}

function resetForm() {
    document.getElementById("main-tariff").value = "";
    document.getElementById("tariff").value = "";
    document.getElementById("address").value = "";
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Подключить';
    }
}

// Закрытие модального окна
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('successModal').style.display = 'none';
});

// Инициализация
showCard(currentIndex);
