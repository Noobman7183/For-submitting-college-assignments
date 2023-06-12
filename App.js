import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/AntDesign';

const formatTime = (seconds = 0) => { // 시간을 소수점 없이 시, 분, 초로 나누게 하는 코드
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds - hrs * 3600) / 60);
  const secs = Math.floor(seconds - hrs * 3600 - mins * 60); 
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  if(mins > 0){
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `0:${secs < 10 ? '0' : ''}${secs}`; 
};

const displayPitch = (pitchValue) => { // 피치값 보정 함수
  if (pitchValue === 1) {
    return 0;
  }

  let result;
  if (pitchValue < 1) {
    result = -12 * (1 - pitchValue) / 0.5;
  } else {
    result = 12 * (pitchValue - 1) / 1;
  }

  return result.toFixed(2);
};

const App = () => {
  const soundRef = useRef(null);
  const [songTitle, setSongTitle] = useState(""); // 곡의 제목
  const [currentTime, setCurrentTime] = useState(0); // 곡의 현재 시간
  const [duration, setDuration] = useState(0); // 곡의 총 시간
  const [isPlaying, setIsPlaying] = useState(false); // 곡의 재생 여부
  const [pitch, setPitch] = useState(1.0); // 곡의 피치
  const [rate, setRate] = useState(1.0); // 곡의 배속
  const [repeat, setRepeat] = useState(false); // 곡의 반복 여부
  const [loading, setLoading] = useState(true); // 곡의 로딩 여부

  useEffect(() => { // react-native-sound를 활용
    const filepath = './assets/music/Popular-Potpourri.mp3'; // 파일의 경로
    const fileName = filepath.split('/').pop().split('.')[0]; // 파일 이름을 추출하는 변수
    setSongTitle(fileName);
    soundRef.current = new Sound(require(filepath), Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
      soundRef.current.setVolume(1.0);
      soundRef.current.setNumberOfLoops(repeat ? -1 : 0);
      setDuration(soundRef.current.getDuration());
    });

    
  
    const intervalId = setInterval(() => { // 곡의 현재 시간과 로딩 이후 총 시간을 받아오는 코드
      if (soundRef.current) {
        soundRef.current.getCurrentTime((seconds) => {
          setCurrentTime(Math.floor(seconds));
          if (loading && seconds > 0) {
            setDuration(soundRef.current.getDuration());
            setLoading(false);
          }
        });
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
      if (soundRef.current) {
        soundRef.current.release();
      }
    };
  }, []);

  useEffect(() => { // repeat가 true일시 곡을 다시 반복
    if (soundRef.current) {
      soundRef.current.setNumberOfLoops(repeat ? -1 : 0);
    }
  }, [repeat]);

  const togglePlay = () => { // 곡을 정지하는 코드
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play(() => setIsPlaying(false)); // Add this to change icon when track finished
    }
    setIsPlaying(!isPlaying);
  };

  const changePitch = (newPitch) => { // 곡의 피치를 바꾸는 코드 
    soundRef.current.setPitch(newPitch);
    setPitch(newPitch);
  };

  const changeRate = (newRate) => { // 곡의 배속을 바꾸는 코드
    soundRef.current.setSpeed(newRate);
    setRate(newRate);
  };

  return (
    <View style={styles.container}>
      <Text style={{ color: 'white', fontSize: 30, marginBottom: 50 }}>{`Now Playing : ${songTitle}`}</Text>
      <Text style={{ color: 'white' }}>{`${formatTime(currentTime)} / ${formatTime(duration)}`}</Text>
      <Slider // 곡의 슬라이더
        style={styles.slider}
        value={currentTime}
        thumbTintColor="white"
        minimumTrackTintColor="white"
        maximumTrackTintColor="white"
        maximumValue={duration}
        onSlidingComplete={(value) => soundRef.current.setCurrentTime(value)}
      />
      <Text style={{ color: 'white' }}>Pitch</Text>
      <Slider // 피치 슬라이더
        style={styles.slider}
        value={pitch}
        thumbTintColor="white" 
        minimumTrackTintColor="white" 
        maximumTrackTintColor="white" 
        minimumValue={0.5}
        maximumValue={2.0}
        onSlidingComplete={changePitch}
      />
      <Text style={{ color: 'white' }}>Speed</Text>
      <Slider // 배속 슬라이더
        style={styles.slider}
        value={rate}
        thumbTintColor="white" 
        minimumTrackTintColor="white" 
        maximumTrackTintColor="white" 
        minimumValue={0.5}
        maximumValue={2.0}
        onSlidingComplete={changeRate}
      />
      {/* // 현재 피치를 알려주는 텍스트 */}
      <Text style={styles.timeStamp}>{`Playback pitch: ${displayPitch(pitch)}`}</Text>
      {/* // 현재 배속을 알려주는 텍스트 */}
      <Text style={styles.timeStamp}>{`Playback speed: ${rate.toFixed(2)}`}</Text>
      <View style={styles.controlRow}>
        <TouchableOpacity style={styles.icon} onPress={() => soundRef.current.setCurrentTime(Math.max(0, currentTime - 10))}>
          <Icon name="stepbackward" size={44} color="white" />
          {/* 곡을 10초 이전부터 재생하는 버튼 */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon} onPress={togglePlay}>
          <Icon name={isPlaying ? "pausecircle" : "playcircleo"} size={44} color="white" /> 
          {/* // 곡을 정지 및 재생하는 버튼 */}
        </TouchableOpacity> 
        <TouchableOpacity style={styles.icon} onPress={() => soundRef.current.setCurrentTime(Math.min(duration, currentTime + 10))}>
          <Icon name="stepforward" size={44} color="white" />
          {/* // 곡을 10초 이후부터 재생하는 버튼  */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon} onPress={() => setRepeat(!repeat)}>
        <Icon name="retweet" size={44} color={repeat ? "white" : "grey"} /> 
        {/* // 곡을 반복하는 버튼 */}
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  slider: {
    width: 400,
    height: 80,
  },
  controlRow: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  timeStamp: {
    color: 'white',
    marginVertical: 2, 
    fontSize: 20
  },
  icon: {
    marginVertical: 20,
    marginHorizontal: 10,
  },
});

export default App;
