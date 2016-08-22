
from datetime import datetime
import json

f = open('data.json')
data_string = f.read()
data = json.loads(data_string)

calendar_data = data['calendar']

del calendar_data ['2012']
for month, messages_by_day in calendar_data['2013'].items():
	if int(month) < 7:
		del calendar_data['2013'][month]

for day, messages_by_name in calendar_data['2013']['7'].items():
	if int(day)<15:
		del calendar_data['2013']['7'][day]

all_messages = []

for year, messages_by_month in calendar_data.items():
	for month, messages_by_day in messages_by_month.items():
		for day, messages_by_name in messages_by_day.items():
			for name, messages in messages_by_name.items():
				for message in messages:
					message['date'] = datetime.strptime(message['timestamp'],'%B %d %Y at %I:%M%p %Z')
					message['timestamp'] = message['date'].strftime('%B %d, %Y %H:%M:00')
					message['name']=name
					all_messages.append(message)

def getKey(message):
    return message['date']

sorted_messages = sorted(all_messages, key = getKey)

for message in sorted_messages:
Å

	del message['date']

sorted_data = json.dumps(sorted_messages)
f = open('sorted_data.json','w')
f.write(sorted_data)