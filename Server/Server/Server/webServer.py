from bottle import route, run, template, get, post, request, static_file
import os.path

#register to server - send name and get credentials (to send every time)  V
#check for opponent - send credentials and get if has matched enemy + 
#    enemy id + playerNumber (1 or 2) V
#return only board ? for the JS remakePage()
#send move - send creds and move+move idx V
#get move - send creds get last move+move idx  V
#end session - inform the server the user is deconnecting

#a game ends when both users re-registers or end_session


PATH = r'F:\Nir\Talpiot\1st year\Programming Project\Project'

class User:
    next_id = 0 #static var
    def __init__(self, name):
        self.id = User.next_id
        User.next_id += 1
        self.name = name
        self.game = None

    def set_game(self, game):
        self.game = game

    def get_op(self):
        if self.game:
            return self.game.get_op(self)
        else:
            return None

    def get_player_number(self):
        if self.game:
            return self.game.get_number(self)
        else:
            return None
    
    def quit_game(self):
        if self.game:
            self.game.user_quit(self)

class Game:
    next_game_id = 0 #static var
    def __init__(self, user1, user2):
        self.game_id = Game.next_game_id
        Game.next_game_id += 1
        self.user1 = user1
        self.user2 = user2

        self.user1.set_game(self)
        self.user2.set_game(self)
        self.moves = [Move(0,-1,-1)] #has to have some move at first

    def get_op(self, user):
        if self.user1 == user:
            return self.user2
        else:
            return self.user1

    def get_number(self, user):
        if self.user1 == user:
            return 1
        if self.user2 == user:
            return 2
        return 0 #not in this game

    def user_quit(self, user):
        if self.user1 == user:
            self.user1 = None
        else:
            self.user2 = None
        self.handle_kill_game()

    def handle_kill_game(self):
        if not self.user1 and not self.user2:
            del games[self.game_id]

    def add_move(self, move_id, row, col):
        if move_id == len(self.moves): #make sure we're not adding an old move
            move = Move(move_id,row,col)
            self.moves.append(move)

    def get_last_move_dict(self):
        return self.moves[-1].get_move_dict()

class Move:
    def __init__(self, move_id, row, col):
        self.move_id = move_id
        self.row = row
        self.col = col

    def get_move_dict(self):
        return {'Row': self.row, 'Col': self.col, 'MoveID': self.move_id}


users = dict()
games = dict()
waiting_user = 0

@route('/<category>/<filename:path>')
def get_img(category, filename):
    if category in ["img", "css", "js"]:
        return static_file(filename, root=os.path.join(PATH, category))

@route('/')
def main_page():
    return static_file('main_page.html', root=PATH)

@route('/GetBoard')
def main_page():
    return static_file('board.html', root=PATH)

@post('/Register')
def register(): #check format of returend data
    #print(request.POST.dict)
    data = request.POST.dict 
    if 'UserName' in data and data['UserName']:
        user = User(data['UserName'][0])
        users[user.id] = user
        return {"UserID": str(user.id)} #"UserID: {}".format(user.id)
    else:
        return "Empty user name"

@post('/AskForOp')
def ask_for_op():
    global waiting_user
    data = request.POST.dict 
    if 'UserID' in data and data['UserID']:
        user_id = int(data['UserID'][0])
        user = users[user_id]
        user.quit_game()
        if waiting_user:
            game = Game(user, waiting_user)
            games[game.game_id] = game
            waiting_user = None
        else:
            waiting_user = user
        return get_op_response(user)

@post('/GetOp')
def get_op():
    #print(request.POST.dict)
    data = request.POST.dict 
    if 'UserID' in data and data['UserID']:
        user_id = int(data['UserID'][0])
        user = users[user_id]
        return get_op_response(user)

@post('/SendMove')
def send_move():
    data = request.POST.dict 
    #validate input
    if 'UserID' in data and data['UserID'] \
            and ('Row' in data and data['Row'][0].isdecimal()) \
            and ('Col' in data and data['Col'][0].isdecimal()) \
            and ('MoveID' in data and data['MoveID'][0].isdecimal()):
        user_id = int(data['UserID'][0])
        user = users[user_id]
        game = user.game.add_move(int(data['MoveID'][0]), int(data['Row'][0]), int(data['Col'][0]))

@post('/GetMove')
def get_move():
    data = request.POST.dict 
    #validate input
    if 'UserID' in data and data['UserID']:
        user_id = int(data['UserID'][0])
        user = users[user_id]
        return user.game.get_last_move_dict()

@post('/EndSession')
def end_session():
    data = request.POST.dict 
    #validate input
    if 'UserID' in data and data['UserID']:
        user_id = int(data['UserID'][0])
        del users[user_id] 

def match_users(user1, user2):
    user1.set_op(user2)
    user2.set_op(user1)

def get_op_response(user):
    if user.get_op():
        return {"HasEnemy": True, "OpponentName": user.get_op().name, "playerNumber": 
                user.get_player_number()}
    else:
        return {"HasEnemy": False}

run(host='localhost', port=8080)
