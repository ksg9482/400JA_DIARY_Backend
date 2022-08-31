이미지 파일 빌드
sudo docker build -f Dockerfile -t 400ja-mongo:1.0 .

Docker Network 생성
sudo docker network create -d bridge n1

docker-compose 실행
sudo user=root pass=pass env=.env docker-compose up -d