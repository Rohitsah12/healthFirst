import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the types for your modals
type ModalType = 'addWalkin' | 'addPatient' | 'addDoctor' | null;

interface UiState {
  isModalOpen: boolean;
  modalType: ModalType;
}

const initialState: UiState = {
  isModalOpen: false,
  modalType: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<ModalType>) => {
      state.isModalOpen = true;
      state.modalType = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.modalType = null;
    },
  },
});

export const { openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;