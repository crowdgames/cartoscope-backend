Cairns are piles of rocks left by travelers on hikes. They create a sense of community by reminding travelers that there are others, and also encourages them to keep going onwards. 

In this project we will allow players to take breaks by seeing messages and leave messages behind themselves. 

The primary code for this is within ../public/script/task.ts and ../public/templates/tasks/taskTemplate.html. Ostensibly this code should be abstracted out to its own file, but I'm not sure how to do that.

The projects used to test cairns are at:

No cairns (75)
http://cartosco.pe/kioskProject.html#/kioskStart/WfpKAneXebT1
Soapstones, often (77)
http://cartosco.pe/kioskProject.html#/kioskStart/J94tYYPMngNk
Soapstones, rare (78)
http://cartosco.pe/kioskProject.html#/kioskStart/qEEKIgFoFh1m
Emojis, often (79)
http://cartosco.pe/kioskProject.html#/kioskStart/dDONGlkBAGUO
Emojis, rare (80)
http://cartosco.pe/kioskProject.html#/kioskStart/Hzp4vca3LZ4a
Both, often (for LLL use only)
http://cartosco.pe/kioskProject.html#/kioskStart/OfohqkweDjEB

("WfpKAneXebT1", "J94tYYPMngNk", "qEEKIgFoFh1m", "dDONGlkBAGUO", "Hzp4vca3LZ4a", "OfohqkweDjEB")

Some local projects: 

localhost:8081/api/anon/startAnon/B7LnS7Uy6kYu?hitId=bbb?trialId=aaa
http://localhost:8081/kioskProject.html#/kioskStart/B7LnS7Uy6kYu?trialId=bee

Testing cairns frequency 
http://cartosco.pe/api/trials/cairns_frequency_test/<hitId>

Gathering data:
cartosco.pe/api/results/votesKiosk/expertID

Extension thoughts:

Cairns are retrieved regardless of project name, which might lead to future generic cairns to be retrieved from other projects that don't make sense
