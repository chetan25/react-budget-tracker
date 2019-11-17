import { Component } from 'react';
import { Button, Popover, Icon } from 'antd';

interface IProps {
    onError?: () => void;
    onStart?: () => void;
    onResult?: (transcript: string, synthesis: any, speech: any) => void;
    onStop?: () => void;
    onSpeechEnd?: () => void;
    recording?: boolean;
    userName?: string;
}

interface IState {
   voiceActive: boolean;
}

let recognition: any;
let speech: any;
let synthesis: any;
let voices: any;
// let locale: { lang: string; name: string } = {
//     lang: 'en-GB',
//     name: 'Google UK English Male'
// }

const content = (
    <div>
        <p>Open - To Open the Add New Expense Modal</p>
        <p>Close - To close any open Modal</p>
        <p>Log Out - To Log Out of App</p>
        <p>Stop - Stop voice activation</p>
    </div>
);
class VoiceCommand extends Component<IProps, IState> {
    state = {
        voiceActive: false
    };

     componentDidMount(): void {
        const { onResult } = this.props;
        try {
            // @ts-ignore
            let SpeechRecognition: any =  window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            speech = new SpeechSynthesisUtterance();
            synthesis = window.speechSynthesis;
            voices = null;
            setTimeout(() => {
                voices = synthesis.getVoices();
                speech.voice = voices[5];
                speech.volume = 1;
                speech.rate = 1;
                speech.pitch = 1;
            }, 10);

            recognition.continuous = true;
            recognition.onstart = () => {
                console.log('started');
            };

            recognition.onspeechend = () => {
                console.log('ended');
                recognition.stop();
            };
            recognition.onend = () => {
                const { voiceActive } = this.state;
                if (voiceActive) {
                    this.startRecording(false);
                }
            };

            recognition.onerror = (event: any) => {
                if(event.error == 'no-speech') {
                    console.log('error');
                }
            };

            recognition.onresult = (event: any) => {
                // event is a SpeechRecognitionEvent object.
                // It holds all the lines we have captured so far.
                // We only need the current one.
                let current = event.resultIndex;
                // Get a transcript of what was said.
                let transcript = event.results[current][0].transcript;
                const text = transcript.toLowerCase().trim();
                if (text == 'stop') {
                    speech.text = 'Bye User';
                    synthesis.speak(speech);
                    this.stopRecording();
                } else {
                    if (typeof onResult == 'function') {
                        onResult(text, synthesis, speech);
                    }
                }
            };
        }
        catch(e) {
            console.error(e);
        }
    }

    componentWillUnmount(): void {
        recognition = null;
    }

    startRecording = (isFirstTime: boolean = false) => {
        const { onStart, userName } = this.props;
        if (isFirstTime) {
            speech.rate = 0.85;
            speech.text = `Welcome ${userName}, I am Jarvis your Personal Voice Assistant.`;
            synthesis.speak(speech);
            speech.text = '';
            recognition.start();
        } else {
            recognition.start();
        }
        this.setState({ voiceActive: true }, () => {
            console.log('out');
        });
        if (typeof onStart == 'function') {
            onStart();
        }
    };

    stopRecording = () => {
        synthesis.cancel();
        recognition.abort();
        speech.text = '';
        const { onStop } = this.props;
        this.setState({ voiceActive: false });
        recognition.stop();
        if (typeof onStop == 'function') {
            onStop();
        }
    };

    render() {
        const { recording } = this.props;
        return (
            <>
                <Popover content={content} title="Available Commands">
                    <span className='know-more-icon'><Icon type="question-circle" /></span>
                </Popover>
                <Button
                    type="primary"
                    onClick={() => this.startRecording(true)}
                    loading={recording}
                >Activate Voice</Button>
                <Button
                    type="primary"
                    onClick={this.stopRecording}
                    disabled={!recording}
                >Stop Voice</Button>
            </>
        );
    }
}

export default VoiceCommand;