// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    lives: 3,
    level: 1,
    speed: 2,
    spawnRate: 0.02
};

// Shopping cart and wishlist
let cart = [];
let wishlist = [];
let cartCount = 0;
let cartTotal = 0;

// Mobile menu
let mobileMenuOpen = false;

// Game objects
let player = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 80,
    width: 80,
    height: 60,
    speed: 8
};

let fallingObjects = [];
let keys = {};

// Object types
const objectTypes = {
    lipstick: { emoji: '💄', points: 10, isGood: true, colors: ['#ff6b9d', '#c44569', '#8b2635'] },
    mascara: { emoji: '🖤', points: -5, isGood: false },
    perfume: { emoji: '🧴', points: -5, isGood: false },
    mirror: { emoji: '🪞', points: -5, isGood: false },
    brush: { emoji: '🖌️', points: -5, isGood: false },
    powder: { emoji: '🎨', points: -5, isGood: false },
    powerup: { emoji: '✨', points: 0, isGood: true }
};

// Power-up effects
let activePowerUps = {
    invincible: false,
    slowMotion: false,
    doublePoints: false
};

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    keys[e.key.toLowerCase()] = false;
});

// Game functions
function startGame() {
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.speed = 2;
    fallingObjects = [];
    
    player.x = canvas.width / 2 - 40;
    
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'inline-block';
    document.getElementById('gameOverScreen').style.display = 'none';
    
    // Stop start screen animation
    if (startScreenAnimationId) {
        cancelAnimationFrame(startScreenAnimationId);
    }
    
    updateUI();
    gameLoop();
}

function pauseGame() {
    if (gameState.isPlaying) {
        gameState.isPaused = !gameState.isPaused;
        document.getElementById('pauseBtn').textContent = gameState.isPaused ? 'Resume' : 'Pause';
        if (!gameState.isPaused) {
            gameLoop();
        }
    }
}

function gameOver() {
    gameState.isPlaying = false;
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('pauseBtn').style.display = 'none';
    document.getElementById('finalScore').textContent = `Final Score: ${gameState.score}`;
    document.getElementById('gameOverScreen').style.display = 'block';
    
    // Restart start screen animation after a delay
    setTimeout(() => {
        if (!gameState.isPlaying) {
            animateStartScreen();
        }
    }, 2000);
}

function restartGame() {
    startGame();
}

function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('level').textContent = gameState.level;
}

function handleInput() {
    if (keys['ArrowLeft'] || keys['a']) {
        player.x = Math.max(0, player.x - player.speed);
    }
    if (keys['ArrowRight'] || keys['d']) {
        player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    }
}

function spawnFallingObject() {
    if (Math.random() < gameState.spawnRate) {
        const objectTypeNames = Object.keys(objectTypes);
        // Higher chance for lipsticks at lower levels
        const lipstickChance = Math.max(0.3, 0.6 - gameState.level * 0.05);
        const powerUpChance = 0.02; // 2% chance for power-ups
        
        let objectType;
        if (Math.random() < powerUpChance) {
            objectType = 'powerup';
        } else if (Math.random() < lipstickChance) {
            objectType = 'lipstick';
        } else {
            objectType = objectTypeNames[Math.floor(Math.random() * (objectTypeNames.length - 2)) + 1];
        }

        fallingObjects.push({
            x: Math.random() * (canvas.width - 40),
            y: -40,
            width: 40,
            height: 40,
            type: objectType,
            speed: gameState.speed + Math.random() * 2,
            powerUpType: objectType === 'powerup' ? ['shield', 'slow', 'double'][Math.floor(Math.random() * 3)] : null
        });
    }
}

function updateFallingObjects() {
    for (let i = fallingObjects.length - 1; i >= 0; i--) {
        const obj = fallingObjects[i];
        let speed = obj.speed;
        
        // Apply slow motion effect
        if (activePowerUps.slowMotion) {
            speed *= 0.3;
        }
        
        obj.y += speed;

        // Remove objects that have fallen off screen
        if (obj.y > canvas.height) {
            fallingObjects.splice(i, 1);
            continue;
        }

        // Check collision with player
        if (obj.x < player.x + player.width &&
            obj.x + obj.width > player.x &&
            obj.y < player.y + player.height &&
            obj.y + obj.height > player.y) {
            
            const objInfo = objectTypes[obj.type];
            
            if (obj.type === 'powerup') {
                // Handle power-up activation
                activatePowerUp(obj.powerUpType);
                showToast(`Power-up activated: ${obj.powerUpType}!`);
            } else if (objInfo.isGood) {
                let points = objInfo.points;
                if (activePowerUps.doublePoints) {
                    points *= 2;
                }
                gameState.score += points;
                
                // Level up every 100 points
                const newLevel = Math.floor(gameState.score / 100) + 1;
                if (newLevel > gameState.level) {
                    gameState.level = newLevel;
                    gameState.speed += 0.5;
                    gameState.spawnRate = Math.min(0.05, gameState.spawnRate + 0.005);
                    showToast(`Level Up! Now Level ${newLevel}`);
                }
            } else if (!activePowerUps.invincible) {
                gameState.lives--;
                if (gameState.lives <= 0) {
                    gameOver();
                    return;
                }
            }
            
            fallingObjects.splice(i, 1);
            updateUI();
        }
    }
}

function drawPlayer() {
    // Draw basket with gradient
    const gradient = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.height);
    gradient.addColorStop(0, '#8b4513');
    gradient.addColorStop(1, '#654321');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw basket pattern with glow effect
    ctx.strokeStyle = '#ffd93d';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ffd93d';
    ctx.shadowBlur = 10;
    
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(player.x + i * 20, player.y);
        ctx.lineTo(player.x + i * 20, player.y + player.height);
        ctx.stroke();
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw basket rim with gradient
    const rimGradient = ctx.createLinearGradient(player.x - 5, player.y - 5, player.x + player.width + 5, player.y - 5);
    rimGradient.addColorStop(0, '#ffd93d');
    rimGradient.addColorStop(0.5, '#ff6b9d');
    rimGradient.addColorStop(1, '#ffd93d');
    
    ctx.fillStyle = rimGradient;
    ctx.fillRect(player.x - 5, player.y - 5, player.width + 10, 10);
    
    // Add sparkle effects
    ctx.fillStyle = '#ffd93d';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✨', player.x + player.width/2, player.y - 10);
}

function drawFallingObjects() {
    fallingObjects.forEach(obj => {
        const objInfo = objectTypes[obj.type];
        
        // Add glow effect for all objects
        ctx.shadowColor = objInfo.isGood ? '#ffd93d' : '#ff4757';
        ctx.shadowBlur = 15;
        
        if (obj.type === 'lipstick') {
            // Draw lipstick with enhanced gradient and 3D effect
            const gradient = ctx.createLinearGradient(obj.x, obj.y, obj.x, obj.y + obj.height);
            const colors = objInfo.colors;
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            gradient.addColorStop(0, randomColor);
            gradient.addColorStop(0.7, '#8b2635');
            gradient.addColorStop(1, '#2d1b2d');
            
            // Main lipstick body
            ctx.fillStyle = gradient;
            ctx.fillRect(obj.x + 5, obj.y + 5, obj.width - 10, obj.height - 10);
            
            // Lipstick cap with gradient
            const capGradient = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.width, obj.y);
            capGradient.addColorStop(0, '#ffd93d');
            capGradient.addColorStop(0.5, '#ff6b9d');
            capGradient.addColorStop(1, '#ffd93d');
            ctx.fillStyle = capGradient;
            ctx.fillRect(obj.x, obj.y, obj.width, 15);
            
            // Add shine effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(obj.x + 8, obj.y + 8, 5, obj.height - 20);
            
        } else if (obj.type === 'powerup') {
            // Draw power-up with special effects
            const powerUpGradient = ctx.createRadialGradient(
                obj.x + obj.width/2, obj.y + obj.height/2, 0,
                obj.x + obj.width/2, obj.y + obj.height/2, obj.width/2
            );
            powerUpGradient.addColorStop(0, '#ffd93d');
            powerUpGradient.addColorStop(1, '#ff6b9d');
            
            ctx.fillStyle = powerUpGradient;
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            
            // Add rotating sparkles
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            const time = Date.now() * 0.01;
            ctx.fillText('✨', obj.x + obj.width/2 + Math.cos(time) * 5, obj.y + obj.height/2 + Math.sin(time) * 5);
            
        } else {
            // Draw background for other objects with gradients
            let gradient;
            if (obj.type === 'mascara') {
                gradient = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.width, obj.y + obj.height);
                gradient.addColorStop(0, '#000');
                gradient.addColorStop(1, '#333');
            } else if (obj.type === 'perfume') {
                gradient = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.width, obj.y + obj.height);
                gradient.addColorStop(0, '#ddd');
                gradient.addColorStop(1, '#bbb');
            } else if (obj.type === 'mirror') {
                gradient = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.width, obj.y + obj.height);
                gradient.addColorStop(0, '#c0c0c0');
                gradient.addColorStop(1, '#808080');
            } else if (obj.type === 'brush') {
                gradient = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.width, obj.y + obj.height);
                gradient.addColorStop(0, '#8b4513');
                gradient.addColorStop(1, '#654321');
            } else {
                gradient = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.width, obj.y + obj.height);
                gradient.addColorStop(0, '#ffb6c1');
                gradient.addColorStop(1, '#ff69b4');
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Draw emoji with enhanced styling
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = objInfo.isGood ? '#fff' : '#000';
        ctx.strokeStyle = objInfo.isGood ? '#000' : '#fff';
        ctx.lineWidth = 1;
        ctx.strokeText(objInfo.emoji, obj.x + obj.width/2, obj.y + obj.height/2 + 8);
        ctx.fillText(objInfo.emoji, obj.x + obj.width/2, obj.y + obj.height/2 + 8);
    });
}

function drawBackground() {
    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(45, 27, 45, 0.1)');
    gradient.addColorStop(1, 'rgba(139, 38, 53, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw animated background pattern
    const time = Date.now() * 0.001;
    ctx.fillStyle = 'rgba(255, 217, 61, 0.1)';
    for (let i = 0; i < 30; i++) {
        const x = (Math.sin(time + i * 0.5) * 100 + canvas.width / 2) % canvas.width;
        const y = (Math.cos(time * 0.7 + i * 0.3) * 50 + canvas.height / 2) % canvas.height;
        const size = Math.sin(time + i) * 3 + 5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw power-up status indicators
    if (activePowerUps.invincible) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (activePowerUps.slowMotion) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (activePowerUps.doublePoints) {
        ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawUI() {
    // Draw game info on canvas
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    
    // Lives hearts
    for (let i = 0; i < gameState.lives; i++) {
        ctx.fillText('❤️', 20 + i * 30, 40);
    }
    
    // Level indicator
    ctx.fillText(`Level ${gameState.level}`, canvas.width - 120, 40);
}

function drawStartScreen() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001;
    
    // Draw animated background
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 300);
    gradient.addColorStop(0, 'rgba(255, 107, 157, 0.1)');
    gradient.addColorStop(1, 'rgba(45, 27, 45, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw floating lipsticks
    for (let i = 0; i < 5; i++) {
        const x = centerX + Math.sin(time + i * 1.2) * 150;
        const y = centerY + Math.cos(time * 0.8 + i * 0.8) * 100;
        const size = 30 + Math.sin(time + i) * 10;
        
        // Draw lipstick
        const lipstickGradient = ctx.createLinearGradient(x - size/2, y - size, x - size/2, y + size);
        lipstickGradient.addColorStop(0, '#ffd93d');
        lipstickGradient.addColorStop(0.3, '#ff6b9d');
        lipstickGradient.addColorStop(1, '#8b2635');
        
        ctx.fillStyle = lipstickGradient;
        ctx.fillRect(x - size/2, y - size/2, size, size);
        
        // Draw cap
        ctx.fillStyle = '#ffd93d';
        ctx.fillRect(x - size/2, y - size/2, size, size/3);
        
        // Add sparkle effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✨', x, y);
    }
    
    // Draw main title
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#ffd93d';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff6b9d';
    ctx.shadowBlur = 10;
    ctx.fillText('💄 Lipstick Catcher 💄', centerX, centerY - 50);
    
    // Draw subtitle
    ctx.font = '18px Arial';
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 5;
    ctx.fillText('Catch the falling lipsticks!', centerX, centerY - 10);
    
    // Draw animated start button
    const buttonY = centerY + 30;
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = centerX - buttonWidth/2;
    
    // Button background with gradient
    const buttonGradient = ctx.createLinearGradient(buttonX, buttonY, buttonX + buttonWidth, buttonY + buttonHeight);
    buttonGradient.addColorStop(0, '#ff6b9d');
    buttonGradient.addColorStop(1, '#c44569');
    
    ctx.fillStyle = buttonGradient;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff6b9d';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button text
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 0;
    ctx.fillText('🎮 START GAME', centerX, buttonY + 32);
    
    // Draw floating particles
    ctx.fillStyle = 'rgba(255, 217, 61, 0.6)';
    for (let i = 0; i < 20; i++) {
        const x = (Math.sin(time * 2 + i * 0.5) * canvas.width/2) + centerX;
        const y = (Math.cos(time * 1.5 + i * 0.3) * canvas.height/2) + centerY;
        const size = 2 + Math.sin(time + i) * 2;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw instructions
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Use Arrow Keys or WASD to move', centerX, centerY + 100);
    ctx.fillText('Catch 💄 for points, avoid other items!', centerX, centerY + 120);
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

function activatePowerUp(powerUpType) {
    activePowerUps[powerUpType] = true;
    
    // Set duration for each power-up
    const durations = {
        invincible: 5000,
        slowMotion: 3000,
        doublePoints: 10000
    };
    
    setTimeout(() => {
        activePowerUps[powerUpType] = false;
        showToast(`${powerUpType} power-up expired!`);
    }, durations[powerUpType]);
}

function gameLoop() {
    if (!gameState.isPlaying || gameState.isPaused) return;

    handleInput();
    
    // Adjust speed based on power-ups
    if (activePowerUps.slowMotion) {
        spawnFallingObject();
    } else {
        spawnFallingObject();
    }
    
    updateFallingObjects();

    drawBackground();
    drawPlayer();
    drawFallingObjects();
    drawUI();

    requestAnimationFrame(gameLoop);
}

// Create particles for background
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size and position
        const size = Math.random() * 10 + 5;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        
        particlesContainer.appendChild(particle);
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Start screen animation loop
let startScreenAnimationId;

function animateStartScreen() {
    if (!gameState.isPlaying) {
        drawStartScreen();
        startScreenAnimationId = requestAnimationFrame(animateStartScreen);
    }
}

// Initialize particles when page loads
window.addEventListener('load', () => {
    createParticles();
    
    // Initialize canvas
    ctx.fillStyle = '#2d1b2d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Start the animated start screen
    animateStartScreen();
});

// Header scroll effect
let lastScrollY = 0;
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
        header.style.background = 'rgba(26, 11, 26, 0.95)';
        header.style.padding = '15px 50px';
    } else {
        header.style.background = 'rgba(26, 11, 26, 0.9)';
        header.style.padding = '20px 50px';
    }
    
    lastScrollY = currentScrollY;
});

// Mobile Menu Functions
function toggleMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');
    
    mobileMenuOpen = !mobileMenuOpen;
    mobileMenuToggle.classList.toggle('active', mobileMenuOpen);
    mobileNav.classList.toggle('active', mobileMenuOpen);
}

// Shopping Cart Functions
function addToCart(productId) {
    const product = getProductById(productId);
    if (product) {
        cart.push(product);
        cartCount++;
        cartTotal += product.price;
        updateCartUI();
        showToast(`${product.name} added to cart!`);
        animateCartIcon();
    }
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        const product = cart[index];
        cart.splice(index, 1);
        cartCount--;
        cartTotal -= product.price;
        updateCartUI();
        showToast(`${product.name} removed from cart!`);
    }
}

function openCart() {
    document.getElementById('cartModal').style.display = 'block';
    updateCartUI();
}

function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    showToast(`Order placed! Total: ₹${cartTotal.toLocaleString('en-IN')}`);
    cart = [];
    cartCount = 0;
    cartTotal = 0;
    updateCartUI();
    closeCart();
}

function updateCartUI() {
    const cartCountElement = document.getElementById('cartCount');
    const cartItemsElement = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    
    cartCountElement.textContent = cartCount;
    cartTotalElement.textContent = cartTotal.toLocaleString('en-IN');
    
    cartItemsElement.innerHTML = '';
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>₹${item.price.toLocaleString('en-IN')}</p>
            </div>
            <button onclick="removeFromCart('${item.id}')" class="remove-btn">Remove</button>
        `;
        cartItemsElement.appendChild(cartItem);
    });
}

// Wishlist Functions
function toggleWishlist(productId) {
    const product = getProductById(productId);
    if (product) {
        const index = wishlist.findIndex(item => item.id === productId);
        const wishlistBtn = document.querySelector(`[data-product="${productId}"] .wishlist-btn`);
        
        if (index > -1) {
            wishlist.splice(index, 1);
            wishlistBtn.textContent = '♡';
            wishlistBtn.classList.remove('active');
            showToast(`${product.name} removed from wishlist!`);
        } else {
            wishlist.push(product);
            wishlistBtn.textContent = '♥';
            wishlistBtn.classList.add('active');
            showToast(`${product.name} added to wishlist!`);
        }
    }
}

// Color Change Functions
function changeColor(productId, color) {
    const productCard = document.querySelector(`[data-product="${productId}"]`);
    const productColor = productCard.querySelector('.product-color');
    productColor.style.background = color;
    
    // Add animation effect
    productColor.style.transform = 'scale(1.2)';
    setTimeout(() => {
        productColor.style.transform = 'scale(1)';
    }, 200);
}

// Virtual Try-On Functions
function openVirtualTryOn(productId) {
    const product = getProductById(productId);
    if (product) {
        document.getElementById('tryOnModal').style.display = 'block';
        setupVirtualTryOn(product);
    }
}

function closeTryOn() {
    document.getElementById('tryOnModal').style.display = 'none';
}

function setupVirtualTryOn(product) {
    const colorOptions = document.getElementById('colorOptions');
    const lipsPreview = document.getElementById('lipsPreview');
    
    // Set up color options
    colorOptions.innerHTML = '';
    const colors = getProductColors(product.id);
    
    colors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        colorOption.style.background = color;
        colorOption.onclick = () => {
            lipsPreview.style.background = color;
            showToast('Color applied!');
        };
        colorOptions.appendChild(colorOption);
    });
    
    // Set initial color
    lipsPreview.style.background = colors[0];
}

// Utility Functions
function getProductById(productId) {
    const products = {
        'crimson-enigma': { id: 'crimson-enigma', name: 'Crimson Enigma', price: 2499 },
        'rose-mirage': { id: 'rose-mirage', name: 'Rose Mirage', price: 2499 },
        'velvet-shadow': { id: 'velvet-shadow', name: 'Velvet Shadow', price: 2499 },
        'sunset-spell': { id: 'sunset-spell', name: 'Sunset Spell', price: 2499 },
        'plum-elegance': { id: 'plum-elegance', name: 'Plum Elegance', price: 2499 },
        'pink-velvet': { id: 'pink-velvet', name: 'Pink Velvet', price: 2499 }
    };
    return products[productId];
}

function getProductColors(productId) {
    const colorMap = {
        'crimson-enigma': ['#8b2635', '#c44569', '#a52a2a'],
        'rose-mirage': ['#ff6b9d', '#ffd93d', '#ffb6c1'],
        'velvet-shadow': ['#5d4e75', '#8b7355', '#4b0082'],
        'sunset-spell': ['#ff4757', '#ff6b9d', '#ffa502'],
        'plum-elegance': ['#8B008B', '#4B0082', '#9932cc'],
        'pink-velvet': ['#FFB6C1', '#DB7093', '#ffc0cb']
    };
    return colorMap[productId] || ['#ff6b9d'];
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function animateCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.style.animation = 'bounce 0.6s ease-in-out';
    setTimeout(() => {
        cartIcon.style.animation = '';
    }, 600);
}

// Scroll Animation Observer
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all elements with animation classes
    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
        observer.observe(el);
    });
}

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        let current = 0;
        const increment = target / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 20);
    });
}

// Enhanced Game Features
function addPowerUps() {
    // Add power-up objects to the game
    const powerUpTypes = {
        shield: { emoji: '🛡️', duration: 5000, effect: 'invincible' },
        slow: { emoji: '⏰', duration: 3000, effect: 'slowMotion' },
        double: { emoji: '💎', duration: 10000, effect: 'doublePoints' }
    };
    
    // Add power-up spawning logic
    if (Math.random() < 0.001) { // Very rare spawn rate
        const powerUpNames = Object.keys(powerUpTypes);
        const powerUpType = powerUpNames[Math.floor(Math.random() * powerUpNames.length)];
        
        fallingObjects.push({
            x: Math.random() * (canvas.width - 40),
            y: -40,
            width: 40,
            height: 40,
            type: 'powerup',
            powerUpType: powerUpType,
            speed: gameState.speed + Math.random() * 2
        });
    }
}

// Canvas click handler for start screen
function handleCanvasClick(event) {
    if (!gameState.isPlaying) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const buttonY = centerY + 30;
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = centerX - buttonWidth/2;
        
        // Check if click is on the start button
        if (x >= buttonX && x <= buttonX + buttonWidth && 
            y >= buttonY && y <= buttonY + buttonHeight) {
            startGame();
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    document.getElementById('mobileMenuToggle').addEventListener('click', toggleMobileMenu);
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenuOpen) {
                toggleMobileMenu();
            }
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const cartModal = document.getElementById('cartModal');
        const tryOnModal = document.getElementById('tryOnModal');
        
        if (e.target === cartModal) {
            closeCart();
        }
        if (e.target === tryOnModal) {
            closeTryOn();
        }
    });
    
    // Canvas click handler
    canvas.addEventListener('click', handleCanvasClick);
    
    // Setup scroll animations
    setupScrollAnimations();
    
    // Animate counters when they come into view
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    });
    
    document.querySelectorAll('.counter').forEach(counter => {
        counterObserver.observe(counter);
    });
});