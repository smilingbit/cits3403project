import numpy as np
import pandas as pd
import os
import time
import datetime


from flask_cors import CORS
import flask,json
api = flask.Flask(__name__) 
api.config['SQLALCHEMY_COMMIT_ON_TEARDOWN']=True
api.config['SQLALCHEMY_TRACK_MODIFICATIONS']=True
CORS(api, resources=r'/*')
  
  
class DataProvider:
    """
    Game recording and user login function. The interface functions provided are:
    1. add_record(...)
    2. add_user(...)
    3. user_login(...)
    4. change_password(...)
    5. get_record(...)
    6. daily_game(...)

    """
    def __init__(self):
        self.record_database = "record.csv"
        self.user_database = "user.csv"
        self.record_data = None
        self.user_data = None
        self.record_attr_list = ['user_id', 'score', 'time']
        self.user_attr_list = ['user_id', 'password']
        self.__read_record__()
        self.__read_user__()

    def __read_record__(self):
        """
        record_database structure:
            user_id, score, time
        """
        if not os.path.exists(self.record_database):
            head = pd.DataFrame(columns=self.record_attr_list)
            head.to_csv(self.record_database, index=False)
        self.record_data = pd.read_csv(self.record_database)
        self.record_data['user_id'] = self.record_data['user_id'].astype(str)

    def __read_user__(self):
        """
        user_database structure:
            user_id, password
        """

        if not os.path.exists(self.user_database):
            head = pd.DataFrame(columns=self.user_attr_list)
            head.to_csv(self.user_database, index=False)
        self.user_data = pd.read_csv(self.user_database)
        self.user_data = self.user_data.astype(str)

    def __save__(self):
        self.record_data.to_csv(self.record_database, index=False)
        self.user_data.to_csv(self.user_database, index=False)

    def add_record(self, user_id: str, score: int) -> bool:
        """
        Add game record

        :param user_id: user ID
        :param score: User's local score
        :return: True is returned when the addition is successful, otherwise false is returned
        """
        now_time = int(time.time())
        data = {
            self.record_attr_list[0]: [user_id],
            self.record_attr_list[1]: [score],
            self.record_attr_list[2]: [now_time]
        }
        data = pd.DataFrame(data)
        self.record_data = self.record_data.append(data)
        self.__save__()
        return True

    def add_user(self, user_id: str, password: str) -> bool:
        """
        User registration

        :param user_id: user ID
        :param password: User password
        :return: If the user already exists, it returns false; otherwise, it returns true
        """
        data = self.user_data.loc[self.user_data['user_id'] == user_id]
        if not data.empty:
            return False
        data = {
            self.user_attr_list[0]: [user_id],
            self.user_attr_list[1]: [password]
        }
        data = pd.DataFrame(data)
        self.user_data = self.user_data.append(data)
        self.__save__()
        return True
        pass
    def user_login(self, user_id: str, password: str) -> bool:
        """
        user login

        :param user_id: user ID
        :param password: user password
        :return: If the login is successful, return true; otherwise, return false
        """
        data = self.user_data.loc[(self.user_data['user_id'] == user_id) & (self.user_data['password'] == password), :]
        if data.empty:
            return False
        else:
            return True
	
    def change_password(self, user_id, new_password: str, old_password: str) -> bool:
        """
        Change user password

        :param user_id: user ID
        :param new_password: new password
        :param old_password: Original password
        :return: return true when the password is changed successfully, otherwise return false
        """
        if self.user_login(user_id, old_password):
            data = self.user_data.loc[(self.user_data['user_id']==user_id) & (self.user_data['password']==old_password), :]
            data['password'] = new_password
            self.user_data.loc[(self.user_data['user_id'] == user_id) &
                               (self.user_data['password'] == old_password), :] = data
            self.__save__()
            return True
        else:
            return False

    def get_record(self, user_id: str) -> np.ndarray:
        """
        Query all game history of a user

        :param user_id: user ID
        :return: All game records of the user (ranked from high to low by score), and the return type is np.ndarray
        """
        data = self.record_data.loc[(self.record_data['user_id'] == user_id)]
        data = data.sort_values('score', ascending=False)
        return data.values

    def daily_game(self, user_id: str) -> bool:
        """
        Query whether a user has completed at least one game on that day

        :param user_id: user ID
        :return: return true if at least one game has been completed, otherwise return false
        """
        today = datetime.datetime.now().strftime('%Y %m %d')
        start = datetime.datetime.strptime(today, "%Y %m %d")
        end = start + datetime.timedelta(days=1)

        start = int(start.timestamp())
        end = int(end.timestamp())
        data = self.record_data.loc[(self.record_data['user_id'] == user_id) &
                                    (self.record_data['time'] >= start) &
                                    (self.record_data['time'] < end), :]
        if data.empty:
            return False
        else:
            return True

provider = DataProvider()
api = flask.Flask(__name__) 
api.config['SQLALCHEMY_COMMIT_ON_TEARDOWN']=True
api.config['SQLALCHEMY_TRACK_MODIFICATIONS']=True
CORS(api, resources=r'/*')
@api.route('/user_login',methods=['post']) 
def user_login():
	user_id=flask.request.json.get('user_id')
	password=flask.request.json.get('password')
	ren=provider.user_login(user_id,password)
	return json.dumps(ren,ensure_ascii=False)
@api.route('/user_reg',methods=['post'])
def user_reg():
	user_id=flask.request.json.get('user_id')
	password=flask.request.json.get('password')
	ren=provider.add_user(user_id,password)
	return json.dumps(ren,ensure_ascii=False)
@api.route('/add_record',methods=['post']) 
def add_record():
	user_id=flask.request.json.get('user_id')
	score=flask.request.json.get('score')
	ren=provider.add_record(user_id,score)
	return json.dumps(ren,ensure_ascii=False)
@api.route('/get_record',methods=['post']) 
def get_record():
	user_id=flask.request.json.get('user_id')
	print(user_id)
	resu=provider.get_record(user_id)
	arr=[]
	for i in range(0,len(resu)):
		arr1=[]
		for j in range(0,len(resu[i])):
			print(resu[i][j])
			arr1.append(resu[i][j])
		arr.append(arr1)
	print(resu)
	ren={'msg':'Success','data':arr,'status':1000}
	return json.dumps(ren,ensure_ascii=False)
@api.route('/daily_game',methods=['post']) 
def daily_game():
	user_id=flask.request.json.get('user_id')
	ren=provider.daily_game(user_id)
	
	# return json.dumps(ren,ensure_ascii=False)
	return '111'
"""
    the following code is for testing function above
"""
if __name__ == '__main__':
	# provider = DataProvider()  # create database object
	# resu = provider.add_user("yaya", "yaya")  # Add a user
    # print(resu)
	# resu = provider.user_login("Tom2", "1232456")  # user login
	# resu = provider.add_record("Tom2", 3)
	# print(resu)
	# temp = provider.get_record("Tom2")
	# print('get_record',temp)
	# temp = provider.daily_game("Tom2")
	# print('daily_game',temp)
	api.run(port=8888,debug=True,host='127.0.0.1') 
    
    # print(resu)
#     resu = provider.change_password("Tom2", "hhh", "2fwrew")  # Change user password
#     print(resu)
#     resu = provider.add_record("Tom2", 3)  # Add a game record for the user
#     print(resu)

#     temp = provider.get_record("Tom2")  # Get all game records of users
#     print(temp)
#     temp = provider.daily_game("Tom2")  # Judge whether the user has played at least one game today
#     print(temp)
    # pass



