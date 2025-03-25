let currentIndex = 0;
const cards = document.querySelectorAll('.tariff');
const BOT_TOKEN = '7628185270:AAEeK69bRl6iKxlQIApVRcV9RUsutuNSMAA';
const CHAT_ID = '968338148';

// Функции для переключения тарифов
function showCard(index) {
    const isMobile = window.innerWidth <= 768;
    const cardsToShow = isMobile ? 1 : 3;

    cards.forEach((card, i) => {
        card.classList.toggle('active', i >= index && i < index + cardsToShow);
    });
}

function nextCard() {
    const isMobile = window.innerWidth <= 768;
    const cardsToShow = isMobile ? 1 : 3;
    if (currentIndex + cardsToShow < cards.length) currentIndex++;
    showCard(currentIndex);
}

function prevCard() {
    if (currentIndex > 0) currentIndex--;
    showCard(currentIndex);
}

function selectTariff(tariff, discount, description, isMainTariff = true) {
    const mainTariffInput = document.getElementById("main-tariff");
    const tariffInput = document.getElementById("tariff");
    
    if (isMainTariff) {
        mainTariffInput.value = `${tariff} - ${discount} (${description})`;
        tariffInput.value = tariffInput.value.includes("Видеонаблюдение") 
            ? `${mainTariffInput.value} + Видеонаблюдение` 
            : mainTariffInput.value;
    } else {
        if (!mainTariffInput.value) {
            alert("Сначала выберите основной тариф!");
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

// Прямая отправка в Telegram
async function sendToTelegram(formData) {
    const message = `🚀 Новая заявка с сайта:\n\n` +
                   `👤 Имя: ${formData.name || 'Не указано'}\n` +
                   `📞 Телефон: ${formData.phone}\n` +
                   `🏠 Адрес: ${formData.address || 'Не указан'}\n` +
                   `💎 Основной тариф: ${formData.main_tariff}\n` +
                   `📝 Полный тариф: ${formData.tariff}\n` +
                   `⏰ Дата: ${new Date().toLocaleString('ru-RU')}\n\n` +
                   `❗️Срочно обработать!`;

    try {
        // Основной способ отправки через fetch
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка Telegram API');
        }

        return true;
    } catch (error) {
        console.error('Ошибка отправки в Telegram:', error);
        
        // Резервный способ через FormData
        try {
            const form = new FormData();
            form.append('chat_id', CHAT_ID);
            form.append('text', message);
            
            const backupResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                body: form
            });

            return backupResponse.ok;
        } catch (e) {
            console.error('Ошибка резервной отправки:', e);
            return false;
        }
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
    
    // Проверки
    if (!mainTariff || (tariffInput.includes("Видеонаблюдение") && !mainTariff)) {
        alert('Выберите основной тариф!');
        return false;
    }
    
    if (!/^[\d\+]{10,15}$/.test(phoneInput.value)) {
        alert('Введите корректный номер (10-15 цифр)');
        phoneInput.focus();
        return false;
    }

    // Блокировка кнопки
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
    }

    const formData = {
        tariff: tariffInput,
        main_tariff: mainTariff,
        address: document.getElementById("address").value,
        name: document.getElementById("name").value,
        phone: phoneInput.value
    };

    try {
        // Пытаемся отправить с таймаутом 8 секунд
        const success = await Promise.race([
            sendToTelegram(formData),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000))
        ]);

        if (!success) {
            throw new Error('Не удалось отправить в Telegram');
        }

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

// Показ успешной отправки
function showSuccess() {
    const modal = document.getElementById('successModal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Блокировка скролла
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetForm();
    }, 5000);
}

// Показ ошибки
function showError() {
    alert("Не удалось отправить заявку. Пожалуйста, позвоните нам: +7 (991) 424-23-37");
}

// Сброс формы
function resetForm() {
    ["address", "name", "phone", "main-tariff", "tariff"].forEach(id => {
        document.getElementById(id).value = "";
    });
}

// Закрытие модального окна
document.querySelector('.close')?.addEventListener('click', () => {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Инициализация
showCard(currentIndex);
