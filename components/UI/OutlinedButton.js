import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { GlobalStyles } from '../../constants/styles';

function OutlinedButton({onPress, icon, children}) {
    return (
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onPress}>
            <Ionicons style={styles.icon} name={icon} size={18} color={GlobalStyles.colors.primary500} />
            <Text style={styles.text}>{children}</Text>
        </Pressable>
    )
}

export default OutlinedButton;

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginTop: 8,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: GlobalStyles.colors.primary400,
    },
    pressed: {
        opacity: 0.7,
    },
    icon: {
        marginRight: 6,
    },
    text: {
        color: GlobalStyles.colors.primary400,
    }
})