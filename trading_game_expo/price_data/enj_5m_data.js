
const ohlcData = [{"date": "2024-02-26 09:30:00-05:00", "open": "23.239999771118164", "high": "23.239999771118164", "low": "23.239999771118164", "close": "23.239999771118164", "volume": "0"}, {"date": "2024-02-26 09:35:00-05:00", "open": "22.747499465942383", "high": "22.747499465942383", "low": "22.747499465942383", "close": "22.747499465942383", "volume": "398"}, {"date": "2024-02-27 09:30:00-05:00", "open": "22.799999237060547", "high": "22.799999237060547", "low": "22.799999237060547", "close": "22.799999237060547", "volume": "0"}, {"date": "2024-02-27 11:15:00-05:00", "open": "23.190000534057617", "high": "23.190000534057617", "low": "23.190000534057617", "close": "23.190000534057617", "volume": "262"}, {"date": "2024-02-27 14:15:00-05:00", "open": "22.9950008392334", "high": "22.9950008392334", "low": "22.9950008392334", "close": "22.9950008392334", "volume": "197"}, {"date": "2024-02-27 14:20:00-05:00", "open": "22.920000076293945", "high": "22.920000076293945", "low": "22.920000076293945", "close": "22.920000076293945", "volume": "200"}, {"date": "2024-02-27 15:05:00-05:00", "open": "22.934999465942383", "high": "22.934999465942383", "low": "22.800100326538086", "close": "22.800100326538086", "volume": "0"}, {"date": "2024-02-28 14:10:00-05:00", "open": "22.719999313354492", "high": "22.74970054626465", "low": "22.719999313354492", "close": "22.74970054626465", "volume": "997"}, {"date": "2024-03-01 14:25:00-05:00", "open": "22.41010093688965", "high": "22.41010093688965", "low": "22.41010093688965", "close": "22.41010093688965", "volume": "0"}, {"date": "2024-03-01 15:40:00-05:00", "open": "22.565000534057617", "high": "22.565000534057617", "low": "22.565000534057617", "close": "22.565000534057617", "volume": "400"}, {"date": "2024-03-04 11:20:00-05:00", "open": "22.68199920654297", "high": "22.68199920654297", "low": "22.68199920654297", "close": "22.68199920654297", "volume": "0"}, {"date": "2024-03-05 09:30:00-05:00", "open": "22.579999923706055", "high": "22.579999923706055", "low": "22.579999923706055", "close": "22.579999923706055", "volume": "0"}, {"date": "2024-03-05 09:55:00-05:00", "open": "22.420000076293945", "high": "22.420000076293945", "low": "22.420000076293945", "close": "22.420000076293945", "volume": "321"}, {"date": "2024-03-05 10:00:00-05:00", "open": "22.579999923706055", "high": "22.579999923706055", "low": "22.579999923706055", "close": "22.579999923706055", "volume": "150"}, {"date": "2024-03-05 10:30:00-05:00", "open": "22.549999237060547", "high": "22.549999237060547", "low": "22.54640007019043", "close": "22.54640007019043", "volume": "547"}, {"date": "2024-03-05 14:30:00-05:00", "open": "22.579999923706055", "high": "22.579999923706055", "low": "22.579999923706055", "close": "22.579999923706055", "volume": "0"}, {"date": "2024-03-07 13:40:00-05:00", "open": "22.520000457763672", "high": "22.520000457763672", "low": "22.520000457763672", "close": "22.520000457763672", "volume": "26"}, {"date": "2024-03-07 13:50:00-05:00", "open": "22.540000915527344", "high": "22.540000915527344", "low": "22.540000915527344", "close": "22.540000915527344", "volume": "100"}, {"date": "2024-03-07 15:40:00-05:00", "open": "22.566699981689453", "high": "22.566699981689453", "low": "22.540000915527344", "close": "22.540000915527344", "volume": "200"}, {"date": "2024-03-07 15:55:00-05:00", "open": "22.649999618530273", "high": "22.649999618530273", "low": "22.649999618530273", "close": "22.649999618530273", "volume": "0"}, {"date": "2024-03-12 09:55:00-04:00", "open": "22.88330078125", "high": "22.88330078125", "low": "22.88330078125", "close": "22.88330078125", "volume": "357"}, {"date": "2024-03-12 10:15:00-04:00", "open": "22.649999618530273", "high": "22.649999618530273", "low": "22.649999618530273", "close": "22.649999618530273", "volume": "786"}, {"date": "2024-03-12 12:45:00-04:00", "open": "22.799999237060547", "high": "22.799999237060547", "low": "22.799999237060547", "close": "22.799999237060547", "volume": "0"}, {"date": "2024-03-14 10:30:00-04:00", "open": "22.85759925842285", "high": "22.85759925842285", "low": "22.85759925842285", "close": "22.85759925842285", "volume": "274"}, {"date": "2024-03-15 12:20:00-04:00", "open": "23.09000015258789", "high": "23.09000015258789", "low": "23.09000015258789", "close": "23.09000015258789", "volume": "1544"}, {"date": "2024-03-19 12:15:00-04:00", "open": "22.760000228881836", "high": "22.770000457763672", "low": "22.760000228881836", "close": "22.770000457763672", "volume": "0"}, {"date": "2024-03-20 09:30:00-04:00", "open": "22.780000686645508", "high": "22.780000686645508", "low": "22.780000686645508", "close": "22.780000686645508", "volume": "0"}, {"date": "2024-03-22 09:30:00-04:00", "open": "22.920000076293945", "high": "22.920000076293945", "low": "22.920000076293945", "close": "22.920000076293945", "volume": "43"}, {"date": "2024-03-22 15:15:00-04:00", "open": "23.010000228881836", "high": "23.027999877929688", "low": "22.920000076293945", "close": "23.007600784301758", "volume": "1700"}, {"date": "2024-03-22 15:20:00-04:00", "open": "23.007600784301758", "high": "23.010000228881836", "low": "22.920000076293945", "close": "22.920000076293945", "volume": "1230"}, {"date": "2024-03-22 15:40:00-04:00", "open": "22.976499557495117", "high": "23.0", "low": "22.8700008392334", "close": "23.0", "volume": "300"}, {"date": "2024-03-25 09:50:00-04:00", "open": "22.860000610351562", "high": "23.0", "low": "22.860000610351562", "close": "22.881799697875977", "volume": "1019"}, {"date": "2024-03-25 14:10:00-04:00", "open": "22.975799560546875", "high": "23.0", "low": "22.850000381469727", "close": "22.882299423217773", "volume": "2200"}, {"date": "2024-03-25 14:25:00-04:00", "open": "22.850000381469727", "high": "23.0", "low": "22.850000381469727", "close": "23.0", "volume": "600"}, {"date": "2024-03-25 15:55:00-04:00", "open": "22.850000381469727", "high": "22.850000381469727", "low": "22.850000381469727", "close": "22.850000381469727", "volume": "100"}, {"date": "2024-03-26 09:30:00-04:00", "open": "22.850000381469727", "high": "22.850000381469727", "low": "22.850000381469727", "close": "22.850000381469727", "volume": "0"}, {"date": "2024-03-26 10:00:00-04:00", "open": "22.850000381469727", "high": "23.0", "low": "22.850000381469727", "close": "22.956199645996094", "volume": "1515"}, {"date": "2024-03-26 10:15:00-04:00", "open": "22.899999618530273", "high": "22.899999618530273", "low": "22.899999618530273", "close": "22.899999618530273", "volume": "500"}, {"date": "2024-03-26 13:40:00-04:00", "open": "22.864999771118164", "high": "22.864999771118164", "low": "22.864999771118164", "close": "22.864999771118164", "volume": "100"}, {"date": "2024-03-26 15:55:00-04:00", "open": "22.770000457763672", "high": "22.770000457763672", "low": "22.770000457763672", "close": "22.770000457763672", "volume": "200"}, {"date": "2024-03-27 09:45:00-04:00", "open": "22.760000228881836", "high": "22.760000228881836", "low": "22.760000228881836", "close": "22.760000228881836", "volume": "0"}, {"date": "2024-03-27 10:10:00-04:00", "open": "22.899999618530273", "high": "22.899999618530273", "low": "22.84000015258789", "close": "22.84000015258789", "volume": "300"}, {"date": "2024-03-27 11:50:00-04:00", "open": "22.708999633789062", "high": "22.708999633789062", "low": "22.708999633789062", "close": "22.708999633789062", "volume": "180"}, {"date": "2024-03-27 15:25:00-04:00", "open": "22.780000686645508", "high": "22.799999237060547", "low": "22.780000686645508", "close": "22.780000686645508", "volume": "597"}, {"date": "2024-03-28 10:45:00-04:00", "open": "22.799999237060547", "high": "22.799999237060547", "low": "22.799999237060547", "close": "22.799999237060547", "volume": "0"}, {"date": "2024-04-01 10:05:00-04:00", "open": "22.721500396728516", "high": "22.721500396728516", "low": "22.510000228881836", "close": "22.510000228881836", "volume": "7"}, {"date": "2024-04-01 11:50:00-04:00", "open": "22.559099197387695", "high": "22.559099197387695", "low": "22.559099197387695", "close": "22.559099197387695", "volume": "217"}, {"date": "2024-04-02 10:00:00-04:00", "open": "22.774999618530273", "high": "22.774999618530273", "low": "22.744400024414062", "close": "22.744400024414062", "volume": "0"}, {"date": "2024-04-02 10:05:00-04:00", "open": "22.744400024414062", "high": "22.774999618530273", "low": "22.559999465942383", "close": "22.742700576782227", "volume": "800"}, {"date": "2024-04-02 10:25:00-04:00", "open": "22.728200912475586", "high": "22.738500595092773", "low": "22.400999069213867", "close": "22.670000076293945", "volume": "2601"}, {"date": "2024-04-02 10:30:00-04:00", "open": "22.40239906311035", "high": "22.72599983215332", "low": "22.399999618530273", "close": "22.559999465942383", "volume": "1667"}, {"date": "2024-04-02 12:40:00-04:00", "open": "22.450000762939453", "high": "22.450000762939453", "low": "22.450000762939453", "close": "22.450000762939453", "volume": "100"}, {"date": "2024-04-02 13:00:00-04:00", "open": "22.459999084472656", "high": "22.459999084472656", "low": "22.450000762939453", "close": "22.459999084472656", "volume": "360"}, {"date": "2024-04-02 14:45:00-04:00", "open": "22.3700008392334", "high": "22.3700008392334", "low": "22.3700008392334", "close": "22.3700008392334", "volume": "149"}, {"date": "2024-04-02 15:55:00-04:00", "open": "22.450000762939453", "high": "22.579999923706055", "low": "22.450000762939453", "close": "22.579999923706055", "volume": "700"}, {"date": "2024-04-03 10:45:00-04:00", "open": "22.399999618530273", "high": "22.399999618530273", "low": "22.399999618530273", "close": "22.399999618530273", "volume": "0"}, {"date": "2024-04-03 11:10:00-04:00", "open": "22.399999618530273", "high": "22.399999618530273", "low": "22.399999618530273", "close": "22.399999618530273", "volume": "301"}, {"date": "2024-04-03 15:10:00-04:00", "open": "22.530000686645508", "high": "22.530000686645508", "low": "22.530000686645508", "close": "22.530000686645508", "volume": "100"}, {"date": "2024-04-03 15:55:00-04:00", "open": "22.350000381469727", "high": "22.350000381469727", "low": "22.350000381469727", "close": "22.350000381469727", "volume": "121"}, {"date": "2024-04-04 11:35:00-04:00", "open": "22.719999313354492", "high": "22.719999313354492", "low": "22.719999313354492", "close": "22.719999313354492", "volume": "0"}, {"date": "2024-04-04 14:20:00-04:00", "open": "22.4143009185791", "high": "22.4143009185791", "low": "22.4143009185791", "close": "22.4143009185791", "volume": "100"}, {"date": "2024-04-04 15:25:00-04:00", "open": "22.549999237060547", "high": "22.584999084472656", "low": "22.549999237060547", "close": "22.584999084472656", "volume": "200"}, {"date": "2024-04-04 15:30:00-04:00", "open": "22.633100509643555", "high": "22.633100509643555", "low": "22.584999084472656", "close": "22.584999084472656", "volume": "300"}, {"date": "2024-04-04 15:45:00-04:00", "open": "22.579999923706055", "high": "22.579999923706055", "low": "22.579999923706055", "close": "22.579999923706055", "volume": "100"}, {"date": "2024-04-05 10:05:00-04:00", "open": "22.544099807739258", "high": "22.549999237060547", "low": "22.544099807739258", "close": "22.549999237060547", "volume": "0"}, {"date": "2024-04-05 12:05:00-04:00", "open": "22.54990005493164", "high": "22.54990005493164", "low": "22.54990005493164", "close": "22.54990005493164", "volume": "100"}, {"date": "2024-04-05 12:35:00-04:00", "open": "22.553600311279297", "high": "22.553600311279297", "low": "22.553600311279297", "close": "22.553600311279297", "volume": "100"}, {"date": "2024-04-05 12:40:00-04:00", "open": "22.56999969482422", "high": "22.56999969482422", "low": "22.42569923400879", "close": "22.553600311279297", "volume": "300"}, {"date": "2024-04-05 13:25:00-04:00", "open": "22.41710090637207", "high": "22.41710090637207", "low": "22.41710090637207", "close": "22.41710090637207", "volume": "200"}, {"date": "2024-04-05 14:00:00-04:00", "open": "22.414199829101562", "high": "22.56999969482422", "low": "22.414199829101562", "close": "22.56999969482422", "volume": "275"}, {"date": "2024-04-05 15:20:00-04:00", "open": "22.40999984741211", "high": "22.43000030517578", "low": "22.40999984741211", "close": "22.43000030517578", "volume": "400"}, {"date": "2024-04-05 15:30:00-04:00", "open": "22.3700008392334", "high": "22.383899688720703", "low": "22.3700008392334", "close": "22.383899688720703", "volume": "600"}, {"date": "2024-04-05 15:40:00-04:00", "open": "22.3700008392334", "high": "22.454999923706055", "low": "22.3700008392334", "close": "22.370100021362305", "volume": "600"}, {"date": "2024-04-05 15:45:00-04:00", "open": "22.383899688720703", "high": "22.489999771118164", "low": "22.3700008392334", "close": "22.383899688720703", "volume": "500"}, {"date": "2024-04-05 15:55:00-04:00", "open": "22.350000381469727", "high": "22.469999313354492", "low": "22.350000381469727", "close": "22.469999313354492", "volume": "200"}, {"date": "2024-04-08 10:20:00-04:00", "open": "22.51609992980957", "high": "22.51609992980957", "low": "22.51609992980957", "close": "22.51609992980957", "volume": "120"}, {"date": "2024-04-08 14:45:00-04:00", "open": "22.31999969482422", "high": "22.31999969482422", "low": "22.31999969482422", "close": "22.31999969482422", "volume": "690"}, {"date": "2024-04-09 10:00:00-04:00", "open": "22.389999389648438", "high": "22.389999389648438", "low": "22.389999389648438", "close": "22.389999389648438", "volume": "0"}, {"date": "2024-04-09 12:05:00-04:00", "open": "22.473600387573242", "high": "22.489999771118164", "low": "22.34000015258789", "close": "22.340099334716797", "volume": "500"}, {"date": "2024-04-09 12:25:00-04:00", "open": "22.350000381469727", "high": "22.350000381469727", "low": "22.350000381469727", "close": "22.350000381469727", "volume": "200"}, {"date": "2024-04-09 13:15:00-04:00", "open": "22.34000015258789", "high": "22.34000015258789", "low": "22.34000015258789", "close": "22.34000015258789", "volume": "142"}, {"date": "2024-04-09 13:20:00-04:00", "open": "22.350000381469727", "high": "22.350000381469727", "low": "22.350000381469727", "close": "22.350000381469727", "volume": "142"}, {"date": "2024-04-09 14:05:00-04:00", "open": "22.350000381469727", "high": "22.350099563598633", "low": "22.350000381469727", "close": "22.350099563598633", "volume": "200"}, {"date": "2024-04-09 15:10:00-04:00", "open": "22.350000381469727", "high": "22.350000381469727", "low": "22.350000381469727", "close": "22.350000381469727", "volume": "100"}, {"date": "2024-04-09 15:15:00-04:00", "open": "22.350000381469727", "high": "22.3700008392334", "low": "22.350000381469727", "close": "22.3700008392334", "volume": "600"}, {"date": "2024-04-09 15:20:00-04:00", "open": "22.350000381469727", "high": "22.3700008392334", "low": "22.350000381469727", "close": "22.360000610351562", "volume": "1032"}, {"date": "2024-04-09 15:55:00-04:00", "open": "22.350000381469727", "high": "22.398799896240234", "low": "22.350000381469727", "close": "22.350000381469727", "volume": "700"}, {"date": "2024-04-10 09:30:00-04:00", "open": "22.299999237060547", "high": "22.299999237060547", "low": "22.299999237060547", "close": "22.299999237060547", "volume": "0"}, {"date": "2024-04-10 09:35:00-04:00", "open": "22.299999237060547", "high": "22.358600616455078", "low": "22.299999237060547", "close": "22.358600616455078", "volume": "300"}, {"date": "2024-04-10 09:40:00-04:00", "open": "22.292499542236328", "high": "22.299999237060547", "low": "22.1299991607666", "close": "22.13170051574707", "volume": "400"}, {"date": "2024-04-10 10:00:00-04:00", "open": "22.352500915527344", "high": "22.352500915527344", "low": "22.28179931640625", "close": "22.28179931640625", "volume": "465"}, {"date": "2024-04-10 10:10:00-04:00", "open": "22.020000457763672", "high": "22.299999237060547", "low": "22.020000457763672", "close": "22.020099639892578", "volume": "900"}, {"date": "2024-04-10 11:45:00-04:00", "open": "22.020000457763672", "high": "22.020099639892578", "low": "22.020000457763672", "close": "22.020099639892578", "volume": "200"}, {"date": "2024-04-10 11:50:00-04:00", "open": "22.020000457763672", "high": "22.150299072265625", "low": "22.010000228881836", "close": "22.010000228881836", "volume": "0"}, {"date": "2024-04-11 15:50:00-04:00", "open": "21.8799991607666", "high": "21.899999618530273", "low": "21.8799991607666", "close": "21.889999389648438", "volume": "20"}, {"date": "2024-04-12 11:20:00-04:00", "open": "21.739999771118164", "high": "21.8799991607666", "low": "21.729999542236328", "close": "21.729999542236328", "volume": "800"}, {"date": "2024-04-12 11:25:00-04:00", "open": "21.8799991607666", "high": "21.90999984741211", "low": "21.729999542236328", "close": "21.730100631713867", "volume": "2522"}, {"date": "2024-04-12 12:40:00-04:00", "open": "21.75", "high": "21.75", "low": "21.75", "close": "21.75", "volume": "100"}, {"date": "2024-04-12 13:10:00-04:00", "open": "21.65999984741211", "high": "21.75", "low": "21.65999984741211", "close": "21.729999542236328", "volume": "2588"}, {"date": "2024-04-15 10:15:00-04:00", "open": "21.450000762939453", "high": "21.450000762939453", "low": "21.141599655151367", "close": "21.141599655151367", "volume": "0"}, {"date": "2024-04-15 11:20:00-04:00", "open": "21.270000457763672", "high": "21.385000228881836", "low": "21.149999618530273", "close": "21.385000228881836", "volume": "0"}, {"date": "2024-04-16 11:40:00-04:00", "open": "21.260000228881836", "high": "21.260000228881836", "low": "21.260000228881836", "close": "21.260000228881836", "volume": "109"}, {"date": "2024-04-16 11:45:00-04:00", "open": "21.280000686645508", "high": "21.280000686645508", "low": "21.280000686645508", "close": "21.280000686645508", "volume": "0"}, {"date": "2024-04-16 13:05:00-04:00", "open": "21.25429916381836", "high": "21.25429916381836", "low": "21.25429916381836", "close": "21.25429916381836", "volume": "699"}, {"date": "2024-04-16 13:10:00-04:00", "open": "21.226299285888672", "high": "21.226299285888672", "low": "21.226299285888672", "close": "21.226299285888672", "volume": "204"}, {"date": "2024-04-17 10:05:00-04:00", "open": "21.25", "high": "21.3882999420166", "low": "21.25", "close": "21.3882999420166", "volume": "0"}, {"date": "2024-04-17 11:40:00-04:00", "open": "21.25", "high": "21.25510025024414", "low": "21.25", "close": "21.25510025024414", "volume": "300"}, {"date": "2024-04-17 15:40:00-04:00", "open": "21.424999237060547", "high": "21.424999237060547", "low": "21.270000457763672", "close": "21.270000457763672", "volume": "600"}, {"date": "2024-04-17 15:55:00-04:00", "open": "21.407400131225586", "high": "21.407400131225586", "low": "21.270099639892578", "close": "21.270099639892578", "volume": "200"}, {"date": "2024-04-18 09:55:00-04:00", "open": "21.270000457763672", "high": "21.3523006439209", "low": "21.270000457763672", "close": "21.280000686645508", "volume": "100"}, {"date": "2024-04-18 10:00:00-04:00", "open": "21.270000457763672", "high": "21.270099639892578", "low": "21.270000457763672", "close": "21.270099639892578", "volume": "600"}, {"date": "2024-04-18 10:05:00-04:00", "open": "21.35099983215332", "high": "21.35099983215332", "low": "21.35099983215332", "close": "21.35099983215332", "volume": "108"}, {"date": "2024-04-18 11:00:00-04:00", "open": "21.331300735473633", "high": "21.331300735473633", "low": "21.331300735473633", "close": "21.331300735473633", "volume": "1081"}, {"date": "2024-04-18 12:05:00-04:00", "open": "21.270000457763672", "high": "21.353500366210938", "low": "21.270000457763672", "close": "21.353500366210938", "volume": "200"}, {"date": "2024-04-18 12:10:00-04:00", "open": "21.364999771118164", "high": "21.364999771118164", "low": "21.364999771118164", "close": "21.364999771118164", "volume": "100"}, {"date": "2024-04-18 12:40:00-04:00", "open": "21.270000457763672", "high": "21.351900100708008", "low": "21.270000457763672", "close": "21.32900047302246", "volume": "535"}, {"date": "2024-04-18 12:45:00-04:00", "open": "21.270000457763672", "high": "21.270099639892578", "low": "21.270000457763672", "close": "21.270099639892578", "volume": "700"}, {"date": "2024-04-18 12:50:00-04:00", "open": "21.270000457763672", "high": "21.270099639892578", "low": "21.270000457763672", "close": "21.270099639892578", "volume": "203"}, {"date": "2024-04-18 14:05:00-04:00", "open": "21.270000457763672", "high": "21.270099639892578", "low": "21.270000457763672", "close": "21.270099639892578", "volume": "700"}, {"date": "2024-04-18 14:35:00-04:00", "open": "21.270000457763672", "high": "21.270000457763672", "low": "21.270000457763672", "close": "21.270000457763672", "volume": "100"}, {"date": "2024-04-18 15:05:00-04:00", "open": "21.459999084472656", "high": "21.459999084472656", "low": "21.459999084472656", "close": "21.459999084472656", "volume": "175"}, {"date": "2024-04-18 15:15:00-04:00", "open": "21.270000457763672", "high": "21.364999771118164", "low": "21.270000457763672", "close": "21.270000457763672", "volume": "1100"}, {"date": "2024-04-18 15:25:00-04:00", "open": "21.36639976501465", "high": "21.385000228881836", "low": "21.309999465942383", "close": "21.309999465942383", "volume": "0"}, {"date": "2024-04-19 15:05:00-04:00", "open": "21.309999465942383", "high": "21.309999465942383", "low": "21.309999465942383", "close": "21.309999465942383", "volume": "100"}, {"date": "2024-04-22 15:40:00-04:00", "open": "21.424999237060547", "high": "21.424999237060547", "low": "21.424999237060547", "close": "21.424999237060547", "volume": "0"}, {"date": "2024-04-23 09:50:00-04:00", "open": "21.530000686645508", "high": "21.530000686645508", "low": "21.530000686645508", "close": "21.530000686645508", "volume": "577"}, {"date": "2024-04-23 11:30:00-04:00", "open": "21.81999969482422", "high": "21.829999923706055", "low": "21.81999969482422", "close": "21.81999969482422", "volume": "448"}, {"date": "2024-04-23 12:15:00-04:00", "open": "21.530000686645508", "high": "21.65999984741211", "low": "21.530000686645508", "close": "21.65999984741211", "volume": "618"}];
const ticker = "ENJ_5m";
const category = "crypto";
const humanName = "Enjin Coin";

export { ohlcData, ticker, category, humanName };
