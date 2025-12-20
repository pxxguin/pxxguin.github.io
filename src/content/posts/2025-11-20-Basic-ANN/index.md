---
title: How can deploy ANN in python?
image: /images/test4.png
published: 2025-11-20T00:00:00.000Z
description: MNIST 데이터를 사용해서 기본적인 ANN 구조를 구성하는 방법에 대해서 알아봅시다.
series: Deep Learning Basics
seriesOrder: 1
tags:
  - DeepL
category: DeepL
draft: false
postId: 3
---

### 🧑🏻‍💻 들어가기에 앞서..
> 원래 일반적으로 머신러닝이나, 딥러닝에 대한 책을 보면 처음에 scikit-learn을 활용한 선형 회귀, 분류 이런 문제가 등장합니다. 하지만 저는 그런 전통적 머신러닝은 나중에 설명할거에요. 그 이유는 말이에요.. 전통적 머신러닝이라고 불리는 LR(Logistic Regression), SVM 등은 너무 중요합니다. 이런 모델들은 scikit-learn 모듈로 호출만 하면 사용할 수 있을 정도로 간단합니다.(내부적으로는 전혀 간단하지 않아요..😭) 이런 모델들의 경우 실시간으로 작동되어야하는 상황에서 사용되기에 정말 좋죠. 
> 
> 예를 들어 우리가 IDS(Intrusion Detection System, IDS)를 구축해야한다고 합시다.(여기서 IDS는 침입 탐지 시스템을 의미합니다.) 한마디로 우리는 우리 서버에 DDoS 공격을 보내는 친구들을 잡아야합니다. 실시간으로 우리 서버로 패킷을 날리는 저 친구들을 잡기 위해 우리가 기계학습 모델을 만드는데 딥러닝 모델과 같은 무거운 모델들을 쓸껀가요? 아님, 패킷들을 사진을 찍어서 Transformer 모델에 넣어서 악성 사용자와 일반 사용자를 구분할껀가요? 
> 
> 예.. 그렇습니다. 
> 
> 매 순간 SOTA(State of the Art, SOTA) 모델들을 쓰면 좋아요. 하지만 ==좋은 모델일수록, 모델의 복잡도가 증가하고 연산량도 함께 증가==합니다. 그래서 우리는 상황에 맞는 모델을 선택해야한다는거죠. IDS 같은 경우, 굳이 Transformer 모델들을 사용하지 않고도 LR과 같은 모델을 사용해서 ==더 빠르게 실시간으로 사용==할 수 있다는거죠.
>
> 이게 우리가 기초부터 배워야하는 이유입니다. 기초라고 하면, 선형 회귀부터가 아니냐 하시는 분들도 있겠지만 저는 딥러닝의 기본부터 시작할겁니다. 😍

### 🚋 인공신경망(Artificial Neural Network, ANN)은 무엇인가?
인공신경망.. 좀 생소하죠? 간단하게 우리 뇌를 생각하면 됩니다. 우리의 뇌는 ==뉴런에서 뉴런으로 신호가 전달==되는 형식이잖아요? 인공신경망은 이러한 뇌의 작동을 베낀거죠.(밑의 그림은 나무위키에서 퍼왔습니다..)
<img src="https://i.namu.wiki/i/pdEoWDoLmv5lcQLKe2FA6anz6SD_VwDkqKhSsqBW-pUrBEf9ShO3Oi1sbcEAICWF2k2jLKqqZYbJI--DqBe33g.svg" alt="transformer" width="400" style="display: block; margin: 0 auto;">
여기 보면, 입력층, 은닉층, 출력층 이렇게 구성되어있잖아요. 이걸 우리 뇌에 대입해서 생각해보면 이렇게 됩니다. 저기 멀리있는 사슴을 봐요. 사슴 이미지가 눈을 거쳐서 뇌의 하나의 뉴런에 입력되겠죠? 이렇게 입력된 이미지가 :spoiler[은닉층]을 거쳐서 출력층으로 나오는데 출력값이 바로 사슴인거죠.

:::important
자, 인공지능을 공부하다보면 설명 가능한 AI(eXplainable AI, XAI)를 볼 기회가 있는데요. 일반적인 인공지능 모델들은 블랙박스(BlackBox) 모델이라고 불립니다. 블랙박스가 그 자동차에 있는 블랙박스가 아니고, 원어 그대로 검정색 박스입니다. 검정색 박스 안에 흰색 공, 빨간색 공을 넣고 박스 안에 손을 넣어서 만져보면 이 공이 어떤 색의 공인지 알 수 있나요? 어림도 없겠죠. 

==모델의 내부의 작동 방식을 이해할 수 없는 모델을 바로 블랙박스 모델==이라고 합니다. 왜 여기서 블랙박스 모델이 나왔을까요? 입력층, 은닉층, 출력층 중에서 은닉층은 어떻게 사슴 이미지가 입력되었을 때 출력이 사슴이 되는지 눈으로 보이지 않습니다. 그래서! 은닉층을 가진 신경망 모델을 블랙박스 모델이라고 하는거죠. 따라서 ==은닉층의 내부 작동 방식을 구체적으로 알아내는 것, 사슴 이미지 데이터를 왜 사슴으로 판단했는지는 알기 어렵습니다.==
:::

### 🛸 완전연결 신경망이란?
완전연결 신경망(Fully Connected Layer, FC Layer)은 아마 BERT 포스팅에서 이미 언급한바가 있습니다. 위의 인공신경망처럼 노드와 간선이 모두 연결되어있는 상태를 우리가 FC Layer라고 부릅니다. 여기에는 중요한 특징이 있는데요!
- ⭐️ 정말 정말 중요한 특징 ⭐️
  - 입력층 -> 은닉층 -> 출력층으로 순차적 진행
  - 이미지의 경우 2차원 또는 3차원으로 구성되는데 무조건 평탄화를 해야함
  - 연산량이 넘 많음..

물론 데이터가 거꾸로 이동하는 경우도 있는데 나중에 설명하겠지만 그걸 ==역전파(Back Propagation)==이라고 합니다.

### ❤️‍🔥 실제 MNIST로 ANN 구현
이제부터는 ANN을 실제로 구현해볼겁니다. 차근차근 설명할테니깐, 천천히 따라오세요!

1. 필수 라이브러리 호출
> 일단 필요한 라이브러리를 가져올게요.
```py
# 필요한 라이브러리
import torch # torch라고 하는 유명한 딥러닝 라이브러리!
import torch.nn as nn
import torch.nn.functional as F
from torchvision.transforms import ToTensor # torch에서의 데이터형을 tensor라고 하는데, tensor로 변형해줌
from torch.utils.data import DataLoader
from torchvision.datasets import MNIST # 그 유명한 MNIST 데이터셋
```

1. 기본적인 은닉층 2개를 가진 ANN 설계

> 어.. class를 모르는 사람은 없을거라고 생각하고 class 형태로 만들었습니다.

```py
class basicANN(nn.Module): # nn.Module로 상속
    def __init__(self, input_layer, hidden_layer_1, hidden_layer_2, output_layer): # 각 차원 입력 받음
        super().__init__()
        self.fc1 = nn.Linear(in_features=input_layer, out_features=hidden_layer_1) # 입력층 -> 은닉층 1
        self.fc2 = nn.Linear(in_features=hidden_layer_1, out_features=hidden_layer_2) # 은닉층 1 -> 은닉층 2
        self.fc3 = nn.Linear(in_features=hidden_layer_2, out_features=output_layer) # 은닉층 2 -> 출력층
        self.relu = nn.ReLU() # 활성화 함수
        
    def forward(self, data):
        result = self.fc1(data) # 입력층 -> 은닉층 1
        result = self.relu(result) # 입력층 -> 은닉층 1
        
        result = self.fc2(result) # 은닉층 1 -> 은닉층 2
        result = self.relu(result) # 은닉층 1 -> 은닉층 2
        
        result = self.fc3(result) # 은닉층 2 -> 출력층
        return result
```

2. 학습 모델 초기 선언

모델을 만들었으니까, 이제 학습을 시켜야겠죠?
```py
class causalMNIST: # MNIST 추론하는 모델이라 causalMNIST로 함
    def __init__(self):
        train_data = MNIST(root='./db/',
                           train=True, # 훈련데이터
                           transform=ToTensor(),
                           download=True)
        test_data = MNIST(root='./db/',
                          train=False, # 테스트 데이터
                          transform=ToTensor(),
                          download=True)
        self.train_loader = DataLoader(dataset=train_data,
                                       batch_size=64,
                                       shuffle=True)
        self.test_loader = DataLoader(dataset=test_data,
                                      batch_size=64,
                                      shuffle=True)
        self.lr = 1e-2 # 학습률
        self.loss = nn.CrossEntropyLoss() # 손실함수
        self.model = basicANN(input_layer=784, hidden_layer_1=256, hidden_layer_2=128, output_layer=10)
        self.optimizer= torch.optim.SGD(params=self.model.parameters(), lr=self.lr) # 최적화 알고리즘(SGD)
        self.epochs = 10 # 반복 횟수
```

3. 학습 알고리즘 구현

> 학습을 하는 알고리즘인데, CNN을 하던, 어떤 모델을 하건 반복되는 코드들 입니다.

```py
    def train(self):
        self.model.train() # 이 함수가 훈련 함수라는걸 명시
        total_loss = [] # epoch마다 손실값을 계산
        for epoch in range(self.epochs):
            epoch_loss = 0.0 # 초기 epoch는 0점
            for batch in self.train_loader:
                data, target = batch # batch는 훈련데이터와 타겟데이터를 보유
                data = data.flatten(start_dim=1) # 그림 데이터는 펼쳐야함
                outputs = self.model(data) # 모델의 결과값 반환
                self.optimizer.zero_grad() # 가중치 초기화
                loss = self.loss(outputs, target) # 손실값 계산
                loss.backward() # 역전파 진행
                self.optimizer.step() # 가중치 업데이트
                epoch_loss += loss.item() # 손실값 합산
            total_loss.append(epoch_loss/len(self.train_loader))
            print(f'Epoch {epoch+1}: {epoch_loss/len(self.train_loader)}')

"""결과
Epoch 1 - Train Loss: 1.6554974187284643
Epoch 2 - Train Loss: 0.543492923031992
Epoch 3 - Train Loss: 0.39310357235133775
Epoch 4 - Train Loss: 0.34325988516052647
Epoch 5 - Train Loss: 0.3131278772661681
Epoch 6 - Train Loss: 0.29044023840062655
Epoch 7 - Train Loss: 0.27121127403176415
Epoch 8 - Train Loss: 0.2539121313278736
Epoch 9 - Train Loss: 0.23871541319132994
Epoch 10 - Train Loss: 0.22421219388146135
"""
```

4. 테스트 알고리즘 구현

> 이제 테스트 데이터의 손실값 계산과 정확도를 계산하겠습니다.

```py
   def test(self):
        self.model.eval()
        total_loss = 0.0
        correct_predictions = 0 # 맞은 개수
        total_samples = 0 # 전체 샘플 수
        with torch.no_grad():
            for batch in self.test_loader:
                data, target = batch
                data = data.flatten(start_dim=1)
                outputs = self.model(data)
                loss = self.loss(outputs, target)
                total_loss += loss.item()
                _, predicted = torch.max(outputs, 1) # 예측값 반환
                correct_predictions += (predicted == target).sum().item() # 예측이랑 정답이랑 같으면 합산
                total_samples += target.size(0)
                accuracy = correct_predictions / total_samples * 100 # 정확도 계산
        print('Test Loss: {}, Accuracy: {}'.format(total_loss/len(self.test_loader), accuracy))

"""결과
Test Loss: 0.21231180204042963, Accuracy: 93.94
"""
```
:::tip
자 어떤가요? ANN만으로도 93%의 정확도가 나오고 훈련에서의 손실과 테스트에서의 손실이 비슷한걸로 미루어보아 과적합은 아닌것 같네요. 하지만 절대 만족할만한 정확도는 아닙니다. 왜 더 좋은 성능이 나오지 못했을까요? 자연어 처리에서의 문제와 비슷한 것 같은데 자연어에서도 단어의 위치, 즉 위치 값이 매우 중요하다고 했죠. 이미지 처리하는데 있어도 ==위치 데이터==가 굉장이 중요합니다. 하지만, 우리는 ==위치 정보를 무시하고 데이터를 펼쳤잖아요?== 이 부분에서 문제가 생긴 것 같습니다. 다음번에는 CNN을 적용시켜서 결과를 비교해보도록 하겠습니다.
:::
