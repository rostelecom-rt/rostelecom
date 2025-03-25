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

function selectTariff(tariff, discount, description) {
    document.getElementById("tariff").value = `${tariff} - ${discount} (${description})`;

    if (window.innerWidth <= 768) {
        const formSection = document.getElementById("application-form");
        formSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

// Новая улучшенная функция отправки формы
async function submitForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const phoneInput = document.getElementById("phone");
    
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
        address: document.getElementById("address").value,
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        date: new Date().toLocaleString()
    };

    // 1. Пробуем отправить через Telegram API
    try {
        const telegramResponse = await sendToTelegram(formData);
        if (telegramResponse.ok) {
            showSuccess();
            return;
        }
    } catch (error) {
        console.error("Ошибка Telegram:", error);
    }

    // 2. Если Telegram не сработал, пробуем через GAS
    try {
        const gasResponse = await sendToGoogleAppsScript(formData);
        if (gasResponse) {
            showSuccess();
            return;
        }
    } catch (error) {
        console.error("Ошибка GAS:", error);
    }

    // 3. Если оба способа не сработали
    showError();
}

// Отправка в Telegram
async function sendToTelegram(formData) {
    const botToken = '7628185270:AAEeK69bRl6iKxlQIApVRcV9RUsutuNSMAA';
    const chatId = '968338148';
    const message = `📌 Новая заявка Ростелеком\n\nТариф: ${formData.tariff}\nАдрес: ${formData.address}\nИмя: ${formData.name}\nТелефон: ${formData.phone}\nДата: ${formData.date}`;
    
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message
            })
        });
        
        return response;
    } catch (error) {
        throw error;
    }
}

// Отправка в Google Apps Script
async function sendToGoogleAppsScript(formData) {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbxVXWpL5p0Bt9-pEzcTUcnybKa1eKzcLMfSK_te4zFV3UhY-krE0G0-XO_4g9s1IENybw/exec";
    
    try {
        const response = await fetch(`${GAS_URL}?${new URLSearchParams(formData)}`, {
            method: 'GET',
            mode: 'no-cors'
        });
        return true; // При успешной отправке
    } catch (error) {
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
    resetForm();
}

function resetForm() {
    // Очищаем все поля, кроме тарифа
    document.getElementById("address").value = "";
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    
    // Восстанавливаем кнопку
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
