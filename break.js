document.addEventListener('DOMContentLoaded', () => {
  const messageTitle = document.getElementById('messageTitle');
  
  chrome.storage.local.get(['customMessage', 'breakDuration', 'theme'], (data) => {
    if (data.customMessage) {
      messageTitle.textContent = data.customMessage;
    }
    
    if (data.theme === 'light') {
      document.body.classList.add('light-mode');
    }
    
    // Start Timer with the configured duration
    const duration = data.breakDuration || 20;
    startBreakTimer(duration);
  });

  const exercises = [
    "Blink your eyes rapidly for 10 seconds, then close them completely and relax.",
    "Palming: Rub your hands together until they are warm, then close your eyes and cover them lightly.",
    "Figure Eight: Imagine a giant figure eight about 10 feet in front of you. Trace it slowly with your eyes.",
    "Near and Far Focus: Focus on a nearby object for a few seconds, then focus on something far away.",
    "Eye Rolling: Roll your eyes in a slow circle, clockwise, then counter-clockwise."
  ];

  let currentExerciseIndex = 0;
  
  const exerciseText = document.getElementById('exerciseText');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const indicatorContainer = document.getElementById('indicatorContainer');

  // Create dots
  exercises.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    indicatorContainer.appendChild(dot);
  });
  const dots = document.querySelectorAll('.dot');

  function updateExercise() {
    exerciseText.style.opacity = 0;
    exerciseText.style.transform = 'translateY(10px) scale(0.98)';
    
    setTimeout(() => {
      exerciseText.textContent = exercises[currentExerciseIndex];
      exerciseText.style.opacity = 1;
      exerciseText.style.transform = 'translateY(0) scale(1)';
      dots.forEach((dot, index) => {
        if (index === currentExerciseIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }, 300);
  }
  
  exerciseText.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

  let autoChangeInterval;
  function startAutoCycle() {
    clearInterval(autoChangeInterval);
    autoChangeInterval = setInterval(() => {
      currentExerciseIndex = (currentExerciseIndex + 1) % exercises.length;
      updateExercise();
    }, 4000); // Automatically change exercises every 4 seconds
  }

  prevBtn.addEventListener('click', () => {
    currentExerciseIndex = (currentExerciseIndex - 1 + exercises.length) % exercises.length;
    updateExercise();
    startAutoCycle(); // Reset timer if manually interacted
  });

  nextBtn.addEventListener('click', () => {
    currentExerciseIndex = (currentExerciseIndex + 1) % exercises.length;
    updateExercise();
    startAutoCycle();
  });

  updateExercise();
  startAutoCycle(); // Start auto cycle

  // Timer logic
  function startBreakTimer(breakDuration) {
    let timeLeft = breakDuration;
    const timerText = document.getElementById('timerText');
    const timerProgress = document.getElementById('timerProgress');
    const skipBtn = document.getElementById('skipBtn');

    // Circumference of the circle (2 * PI * r) -> r = 66
    const circumference = 2 * Math.PI * 66;
    timerProgress.style.strokeDasharray = `${circumference} ${circumference}`;
    
    function updateTimer() {
      timerText.textContent = timeLeft;
      
      // update circular progress
      const offset = circumference - (timeLeft / breakDuration) * circumference;
      timerProgress.style.strokeDashoffset = offset;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        clearInterval(autoChangeInterval); // stop changing exercises when done
        timerText.textContent = "\u2713"; // Checkmark
        timerProgress.style.strokeDashoffset = 0;
        
        // Auto-close countdown
        let closeCount = 3;
        const updateButtonText = () => {
          skipBtn.textContent = `Closing in ${closeCount}...`;
        };
        
        skipBtn.style.color = "var(--text-bright)";
        skipBtn.style.background = "var(--primary)";
        skipBtn.style.borderColor = "var(--primary)";
        skipBtn.style.boxShadow = "0 0 15px rgba(59, 130, 246, 0.5)";
        
        updateButtonText();
        
        const closeInterval = setInterval(() => {
          closeCount--;
          if (closeCount <= 0) {
            clearInterval(closeInterval);
            window.close();
          } else {
            updateButtonText();
          }
        }, 1000);
      }
    }

    const timerInterval = setInterval(() => {
      timeLeft--;
      updateTimer();
    }, 1000);
    
    updateTimer(); // init

    // Skip / Close functionality
    skipBtn.addEventListener('click', () => {
      window.close();
    });
  }
});
