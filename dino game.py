import pygame
import os
import random
import subprocess
import sys
import webbrowser

pygame.init()

# Constants for the mini play area
PLAY_WIDTH = 600
PLAY_HEIGHT = 300
SCREEN = pygame.display.set_mode((0, 0), pygame.FULLSCREEN)
SCREEN_WIDTH, SCREEN_HEIGHT = SCREEN.get_size()

PLAY_X = (SCREEN_WIDTH - PLAY_WIDTH) // 2
PLAY_Y = (SCREEN_HEIGHT - PLAY_HEIGHT) // 2

SCREEN_HEIGHT = 600
SCREEN_WIDTH = 1100
SCREEN = pygame.display.set_mode((0, 0), pygame.FULLSCREEN)
SCREEN_WIDTH, SCREEN_HEIGHT = SCREEN.get_size()

# Load and scale images
def load_scaled_image(path, scale=0.5):
    img = pygame.image.load(path)
    width = int(img.get_width() * scale)
    height = int(img.get_height() * scale)
    return pygame.transform.scale(img, (width, height))

RUNNING = [load_scaled_image(os.path.join("Assets/Dino", "DinoRun1.png")),
           load_scaled_image(os.path.join("Assets/Dino", "DinoRun2.png"))]
JUMPING = load_scaled_image(os.path.join("Assets/Dino", "DinoJump.png"))
DUCKING = [load_scaled_image(os.path.join("Assets/Dino", "DinoDuck1.png")),
           load_scaled_image(os.path.join("Assets/Dino", "DinoDuck2.png"))]

SMALL_CACTUS = [load_scaled_image(os.path.join("Assets/Cactus", f"SmallCactus{i + 1}.png")) for i in range(3)]
LARGE_CACTUS = [load_scaled_image(os.path.join("Assets/Cactus", f"LargeCactus{i + 1}.png")) for i in range(3)]

BIRD = [load_scaled_image(os.path.join("Assets/Bird", f"Bird{i + 1}.png")) for i in range(2)]

CLOUD = load_scaled_image(os.path.join("Assets/Other", "Cloud.png"), 0.4)
BG = load_scaled_image(os.path.join("Assets/Other", "Track.png"), 0.5)

class Dinosaur:
    X_POS = PLAY_X + 250
    Y_POS = PLAY_Y + 160
    Y_POS_DUCK = PLAY_Y + 185
    JUMP_VEL = 8.5

    def __init__(self):
        self.duck_img = DUCKING
        self.run_img = RUNNING
        self.jump_img = JUMPING

        self.dino_duck = False
        self.dino_run = True
        self.dino_jump = False

        self.step_index = 0
        self.jump_vel = self.JUMP_VEL
        self.image = self.run_img[0]
        self.dino_rect = self.image.get_rect()
        self.dino_rect.x = self.X_POS
        self.dino_rect.y = self.Y_POS

    def update(self, userInput):
        if self.dino_duck:
            self.duck()
        if self.dino_run:
            self.run()
        if self.dino_jump:
            self.jump()

        if self.step_index >= 10:
            self.step_index = 0

        if (userInput[pygame.K_UP] or userInput[pygame.K_SPACE]) and not self.dino_jump:
            self.dino_duck = False
            self.dino_run = False
            self.dino_jump = True
        elif userInput[pygame.K_DOWN] and not self.dino_jump:
            self.dino_duck = True
            self.dino_run = False
            self.dino_jump = False
        elif not (self.dino_jump or userInput[pygame.K_DOWN]):
            self.dino_duck = False
            self.dino_run = True
            self.dino_jump = False

    def duck(self):
        self.image = self.duck_img[self.step_index // 5]
        self.dino_rect = self.image.get_rect()
        self.dino_rect.x = self.X_POS
        self.dino_rect.y = self.Y_POS_DUCK
        self.step_index += 1

    def run(self):
        self.image = self.run_img[self.step_index // 5]
        self.dino_rect = self.image.get_rect()
        self.dino_rect.x = self.X_POS
        self.dino_rect.y = self.Y_POS
        self.step_index += 1

    def jump(self):
        self.image = self.jump_img
        if self.dino_jump:
            self.dino_rect.y -= self.jump_vel * 2
            self.jump_vel -= 0.8
        if self.jump_vel < - self.JUMP_VEL:
            self.dino_jump = False
            self.jump_vel = self.JUMP_VEL

    def draw(self, SCREEN):
        SCREEN.blit(self.image, (self.dino_rect.x, self.dino_rect.y))


class Cloud:
    def __init__(self):
        self.x = SCREEN_WIDTH + random.randint(200, 400)
        self.y = PLAY_Y + random.randint(10, 60)
        self.image = CLOUD
        self.width = self.image.get_width()

    def update(self):
        self.x -= game_speed
        if self.x < -self.width:
            self.x = SCREEN_WIDTH + random.randint(200, 400)
            self.y = PLAY_Y + random.randint(10, 60)

    def draw(self, SCREEN):
        SCREEN.blit(self.image, (self.x, self.y))


class Obstacle:
    def __init__(self, image, type):
        self.image = image
        self.type = type
        self.rect = self.image[self.type].get_rect()
        self.rect.x = SCREEN_WIDTH

    def update(self):
        self.rect.x -= game_speed
        if self.rect.x < -self.rect.width:
            obstacles.pop()

    def draw(self, SCREEN):
        SCREEN.blit(self.image[self.type], self.rect)


class SmallCactus(Obstacle):
    def __init__(self, image):
        self.type = random.randint(0, 2)
        super().__init__(image, self.type)
        self.rect.y = PLAY_Y + PLAY_HEIGHT - self.rect.height - 85


class LargeCactus(Obstacle):
    def __init__(self, image):
        self.type = random.randint(0, 2)
        super().__init__(image, self.type)
        self.rect.y = PLAY_Y + PLAY_HEIGHT - self.rect.height - 85


class Bird(Obstacle):
    def __init__(self, image):
        self.type = 0
        super().__init__(image, self.type)
        self.rect.y = PLAY_Y + random.choice([100, 140, 170])
        self.index = 0

    def draw(self, SCREEN):
        if self.index >= 9:
            self.index = 0
        SCREEN.blit(self.image[self.index // 5], self.rect)
        self.index += 1

def main():
    global game_speed, x_pos_bg, y_pos_bg, points, obstacles
    run = True
    clock = pygame.time.Clock()
    player = Dinosaur()
    cloud = Cloud()
    game_speed = 10
    x_pos_bg = PLAY_X
    y_pos_bg = PLAY_Y + 200
    points = 0
    font = pygame.font.Font('freesansbold.ttf', 20)
    obstacles = []
    death_count = 0

    def score():
        nonlocal run
        global points, game_speed
        points += 1
        if points % 100 == 0:
            game_speed += 1
        if points >= 500:
            webbrowser.open("tsukasolutions.html")
            pygame.quit()
            exit()

        text = font.render("Points: " + str(points), True, (0, 0, 0))
        SCREEN.blit(text, (SCREEN_WIDTH - 200, 40))

    def background():
        global x_pos_bg, y_pos_bg
        image_width = BG.get_width()
        SCREEN.blit(BG, (x_pos_bg, y_pos_bg))
        SCREEN.blit(BG, (image_width + x_pos_bg, y_pos_bg))
        if x_pos_bg <= PLAY_X - image_width:
            x_pos_bg = PLAY_X
        x_pos_bg -= game_speed

    while run:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                run = False

        SCREEN.fill((255, 255, 255))
        #pygame.draw.rect(SCREEN, (220, 220, 220), (PLAY_X, PLAY_Y, PLAY_WIDTH, PLAY_HEIGHT))

        # Clip rendering to the play area
        SCREEN.set_clip(pygame.Rect(PLAY_X, PLAY_Y, PLAY_WIDTH, PLAY_HEIGHT))

        userInput = pygame.key.get_pressed()

        player.draw(SCREEN)
        player.update(userInput)

        if len(obstacles) == 0 or (points < 500 and random.random() < 0.014):  # 2% chance to spawn extra
            choice = random.randint(0, 2)
            if choice == 0:
                obstacles.append(SmallCactus(SMALL_CACTUS))
            elif choice == 1:
                obstacles.append(LargeCactus(LARGE_CACTUS))
            else:
                obstacles.append(Bird(BIRD))

#        if len(obstacles) == 0:
#            choice = random.randint(0, 2)
#            if choice == 0:
#                obstacles.append(SmallCactus(SMALL_CACTUS))
#            elif choice == 1:
#                obstacles.append(LargeCactus(LARGE_CACTUS))
#            else:
#                obstacles.append(Bird(BIRD))

        for obstacle in obstacles:
            obstacle.draw(SCREEN)
            obstacle.update()
            if player.dino_rect.colliderect(obstacle.rect):
                pygame.time.delay(2000)
                death_count += 1
                menu(death_count)

        background()
        cloud.draw(SCREEN)
        cloud.update()

        # Remove clip for UI
        SCREEN.set_clip(None)
        score()

        clock.tick(30)
        pygame.display.update()

def menu(death_count):
    global points
    run = True
    while run:
        SCREEN.fill((255, 255, 255))
        font = pygame.font.Font('freesansbold.ttf', 30)

        lines = []
        if death_count == 0:
            lines = [
                "Press any Key to Start",
                "Get to 500 points",
                " ",
                "Appuyez sur n'importe quel bouton pour commencer",
                "Atteignez un score de 500"
            ]
        elif death_count > 0:
            lines = [
                "Press any Key to Restart",
                "Get to 500 points",
                " ",
                "Appuyez sur n'importe quel",
                "bouton pour recommencer",
                "Atteignez un score de 500"
            ]

        # Calculate starting y position to center all lines vertically
        total_height = len(lines) * font.get_height()
        start_y = (SCREEN_HEIGHT // 2) - (total_height // 2)

        # Render and blit each line
        for i, line in enumerate(lines):
            text = font.render(line, True, (0, 0, 0))
            text_rect = text.get_rect(center=(SCREEN_WIDTH // 2, start_y + i * font.get_height()))
            SCREEN.blit(text, text_rect)

        if death_count > 0:
            score = font.render("Your Score: " + str(points), True, (0, 0, 0))
            score_rect = score.get_rect(center=(SCREEN_WIDTH // 2, start_y + len(lines) * font.get_height() + 20))
            SCREEN.blit(score, score_rect)

        SCREEN.blit(RUNNING[0], (SCREEN_WIDTH // 2 - 20, SCREEN_HEIGHT // 2 - 140))
        pygame.display.update()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                run = False
            if event.type == pygame.KEYDOWN:
                main()
menu(death_count=0)