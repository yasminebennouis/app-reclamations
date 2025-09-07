// src/screens/reclamation/CreateReclamationScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { createReclamation } from '@/services/api';
import { ServiceType } from '@/services/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateReclamationScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  // === UI responsive light ===
  const R = useMemo(() => {
    const isXS = width < 360;
    const isMD = width >= 400 && width < 480;
    const isLG = width >= 480;

    const t = (size: number) => {
      const factor = isXS ? 0.92 : isLG ? 1.06 : isMD ? 1.02 : 1;
      return Math.round(size * factor);
    };

    return {
      t,
      cardPad: isXS ? 12 : 16,
      fieldHeight: isXS ? 44 : 46,
      textAreaHeight: isXS ? 110 : 120,
      headerPadV: isXS ? 10 : 12,
      bodyPadH: 16,
      imgHeight: isXS ? 160 : 180,
      gap: isXS ? 8 : 10,
      chipPadH: isXS ? 12 : 14,
      chipPadV: isXS ? 6 : 8,
      submitHeight: isXS ? 50 : 52,
    };
  }, [width]);

  // === state logique (inchangé) ===
  const [service, setService] = useState<ServiceType>(ServiceType.IT);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const goHome = () => navigation.navigate('Home');

  async function pickFromLibrary() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission requise', 'Autorise l’accès à la photothèque pour importer une image.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        quality: 0.7,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
      });
      if (!res.canceled && res.assets?.length) {
        const asset = res.assets[0];
        setImageUri(asset.uri || null);
        setImageBase64(asset.base64 || null);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d’ouvrir la galerie.');
    }
  }

  function clearImage() {
    setImageUri(null);
    setImageBase64(null);
  }

  async function onSubmit() {
    if (!user?.username) return Alert.alert('Erreur', 'Utilisateur non connecté.');
    if (!titre.trim()) return Alert.alert('Validation', 'Le titre est obligatoire.');
    if (!description.trim()) return Alert.alert('Validation', 'La description est obligatoire.');

    setSubmitting(true);
    try {
      const payload: any = {
        service,
        titre: titre.trim(),
        description: description.trim(),
        photoBase64: imageBase64 ?? null,
        photoPath: imageUri ?? null,
      };
      const created = await createReclamation(user.username, payload);
      Alert.alert('Succès', 'Réclamation enregistrée !');
      if (created?.id) {
        navigation.replace('ReclamationDetail', { id: created.id, mode: 'my' });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'MyReclamations', params: { mode: 'my' } }] });
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Erreur lors de la création.';
      Alert.alert('Erreur', msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <LinearGradient colors={['#eef2ff', '#eaf1ff']} style={[styles.root]}>
      {/* Header (safe-area + compact) */}
      <LinearGradient
        colors={['#4F46E5', '#6366F1']}
        style={[
          styles.header,
          {
            paddingTop: insets.top + R.headerPadV,
            paddingBottom: R.headerPadV,
            paddingHorizontal: R.bodyPadH,
          },
        ]}
      >
        <TouchableOpacity style={styles.hBtn} onPress={goHome} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.hTitle, { fontSize: R.t(16) }]}>Nouvelle réclamation</Text>
        {/* Spacer */}
        <View style={{ width: 24 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: R.bodyPadH, paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, { padding: R.cardPad }]}>
            {/* Titre section */}
            <View style={styles.sectionTitleRow}>
              <Ionicons name="document-text-outline" size={20} color="#7c3aed" style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { fontSize: R.t(18) }]}>Nouvelle réclamation</Text>
            </View>

            {/* Service */}
            <View style={styles.block}>
              <Label icon="briefcase-outline" color="#2563eb" text="Service" />
              <View style={styles.chipsRow}>
                {(['IT', 'EQUIPEMENT', 'INFRASTRUCTURE'] as ServiceType[]).map((s) => {
                  const active = service === s;
                  return (
                    <TouchableOpacity key={s} onPress={() => setService(s)} activeOpacity={0.9}>
                      <LinearGradient
                        colors={active ? ['#4F46E5', '#6366F1'] : ['#f3f4f6', '#eef2ff']}
                        style={[
                          styles.chip,
                          active && { backgroundColor: '#4F46E5' },
                        ]}
                      >
                        <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{s}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Titre */}
            <View style={styles.block}>
              <Label icon="text-outline" color="#f59e0b" text="Titre" required />
              <View style={[styles.inputRow, { height: R.fieldHeight }]}>
                <Ionicons name="create-outline" size={18} color="#f59e0b" style={styles.inputIcon} />
                <TextInput
                  placeholder="Titre de la panne"
                  value={titre}
                  onChangeText={setTitre}
                  style={[styles.input, { height: R.fieldHeight }]}
                  autoCapitalize="sentences"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.block}>
              <Label icon="chatbox-ellipses-outline" color="#16a34a" text="Description" required />
              <View style={[styles.inputRow, { minHeight: R.textAreaHeight }]}>
                <Ionicons name="document-outline" size={18} color="#16a34a" style={[styles.inputIcon, { top: 14 }]} />
                <TextInput
                  placeholder="Décrivez la panne..."
                  value={description}
                  onChangeText={setDescription}
                  style={[styles.input, styles.textArea, { height: R.textAreaHeight }]}
                  multiline
                  autoCapitalize="sentences"
                />
              </View>
            </View>

            {/* Photo */}
            <View style={styles.block}>
              <Label icon="image-outline" color="#8b5cf6" text="Photo (optionnel)" />
              <View style={[styles.imageRow, { gap: R.gap }]}>
                <TouchableOpacity style={styles.smallBtn} onPress={pickFromLibrary}>
                  <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                  <Text style={styles.smallBtnTxt}>Importer</Text>
                </TouchableOpacity>
                {!!imageUri && (
                  <TouchableOpacity style={styles.smallBtnDanger} onPress={clearImage}>
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={styles.smallBtnTxt}>Retirer</Text>
                  </TouchableOpacity>
                )}
              </View>
              {!!imageUri && (
                <View style={styles.previewWrap}>
                  <Image source={{ uri: imageUri }} style={[styles.preview, { height: R.imgHeight }]} resizeMode="cover" />
                </View>
              )}
            </View>

            {/* Bouton valider */}
            <TouchableOpacity disabled={submitting} onPress={onSubmit} activeOpacity={0.9}>
              <LinearGradient colors={['#2F80ED', '#1C60D6']} style={[styles.submitBtn, { height: R.submitHeight }]}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.submitTxt, { fontSize: R.t(14) }]}>ENREGISTRER LA RÉCLAMATION</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

/* Label avec icône colorée */
function Label({
  icon,
  text,
  required = false,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  required?: boolean;
  color: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
      <Ionicons name={icon} size={16} color={color} style={{ marginRight: 6 }} />
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }}>
        {text}
        {required && <Text style={{ color: '#ef4444' }}> *</Text>}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hBtnTxt: { color: '#fff', fontWeight: '700' },
  hTitle: { color: '#fff', fontWeight: '800' },

  scrollContent: { paddingTop: 16 },
  card: {
    borderRadius: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontWeight: '800', color: '#0f172a' },

  block: { marginBottom: 14 },

  // chips
  chipsRow: { flexDirection: 'row', justifyContent: 'center' },
  chip: {
    minWidth: 85,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  chipTxt: { color: '#0f172a', fontWeight: '700', fontSize: 11 },
  chipTxtActive: { color: '#fff' },

  // inputs
  inputRow: {
    borderWidth: 1,
    borderColor: '#d0d7e2',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  inputIcon: { position: 'absolute', left: 12, top: 12 },
  input: { paddingLeft: 40, paddingRight: 12, color: '#0f172a' },
  textArea: { textAlignVertical: 'top' },

  // image
  imageRow: { flexDirection: 'row' },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  smallBtnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  smallBtnTxt: { color: '#fff', fontWeight: '800' },
  previewWrap: { marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  preview: { width: '100%' },

  // submit
  submitBtn: {
    marginTop: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitTxt: { color: '#fff', fontWeight: '900', letterSpacing: 0.3 },
});
