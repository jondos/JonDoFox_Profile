FasdUAS 1.101.10   ��   ��    k             l      ��  ��    U O 
  JonDoFox profile installation script for Mac OS X
  2007 by Simon Pecher 
      � 	 	 �   
     J o n D o F o x   p r o f i l e   i n s t a l l a t i o n   s c r i p t   f o r   M a c   O S   X 
     2 0 0 7   b y   S i m o n   P e c h e r   
     
  
 l     ��������  ��  ��        l          p         ������ 0 firefox_profiles_path  ��    / )firefox profile folder's path (as string)     �   R f i r e f o x   p r o f i l e   f o l d e r ' s   p a t h   ( a s   s t r i n g )      l          p         ������ 0 jondoprofile_foldername  ��    H B name of the JondoFox profile folder (within firefox_profile_path)     �   �   n a m e   o f   t h e   J o n d o F o x   p r o f i l e   f o l d e r   ( w i t h i n   f i r e f o x _ p r o f i l e _ p a t h )      l          p         ������ 0 profile_ini_backup_name  ��    1 + name for the file profiles.ini backup file     �     V   n a m e   f o r   t h e   f i l e   p r o f i l e s . i n i   b a c k u p   f i l e   ! " ! l      # $ % # p       & & ������ 0 profiles_ini  ��   $  alias for profiles.ini    % � ' ' , a l i a s   f o r   p r o f i l e s . i n i "  ( ) ( l     ��������  ��  ��   )  * + * i      , - , I     ������
�� .aevtoappnull  �   � ****��  ��   - k     d . .  / 0 / l     �� 1 2��   1 #  initialize global variables	    2 � 3 3 :   i n i t i a l i z e   g l o b a l   v a r i a b l e s 	 0  4 5 4 O     6 7 6 r     8 9 8 b     : ; : l    <���� < l    =���� = c     > ? > n    	 @ A @ 1    	��
�� 
ppth A 1    ��
�� 
cusr ? m   	 
��
�� 
TEXT��  ��  ��  ��   ; m     B B � C C H L i b r a r y : A p p l i c a t i o n   S u p p o r t : F i r e f o x : 9 o      ���� 0 firefox_profiles_path   7 m      D D�                                                                                  sevs   alis    �  Macintosh HD               á$;H+    �System Events.app                                                q���H
        ����  	                CoreServices    á+      ��9�      �  �  �  :Macintosh HD:System:Library:CoreServices:System Events.app  $  S y s t e m   E v e n t s . a p p    M a c i n t o s h   H D  -System/Library/CoreServices/System Events.app   / ��   5  E F E l   �� G H��   G N H if Firefox is running the during installation it may fail, so close it.    H � I I �   i f   F i r e f o x   i s   r u n n i n g   t h e   d u r i n g   i n s t a l l a t i o n   i t   m a y   f a i l ,   s o   c l o s e   i t . F  J K J O    L M L I   ������
�� .aevtquitnull��� ��� null��  ��   M m     N N�                                                                                  MOZB   alis    P  Macintosh HD               á$;H+    ZFirefox.app                                                     ��r��        ����  	                Applications    á+      �r��      Z  %Macintosh HD:Applications:Firefox.app     F i r e f o x . a p p    M a c i n t o s h   H D  Applications/Firefox.app  / ��   K  O P O l   ��������  ��  ��   P  Q R Q r     S T S m     U U � V V  p r o f i l e T o      ���� 0 jondoprofile_foldername   R  W X W r     # Y Z Y m     ! [ [ � \ \   p r o f i l e s . i n i . b a k Z o      ���� 0 profile_ini_backup_name   X  ] ^ ] Q   $ H _ ` a _ r   ' . b c b c   ' , d e d l  ' * f���� f l  ' * g���� g b   ' * h i h o   ' (���� 0 firefox_profiles_path   i m   ( ) j j � k k  p r o f i l e s . i n i��  ��  ��  ��   e m   * +��
�� 
alis c o      ���� 0 profiles_ini   ` R      ������
�� .ascrerr ****      � ****��  ��   a k   6 H l l  m n m I  6 E�� o p
�� .sysodlogaskr        TEXT o m   6 9 q q � r r X S o r r y ,   b u t   y o u   d o n ' t   h a v e   F i r e f o x   i n s t a l l e d . p �� s��
�� 
btns s J   < A t t  u�� u m   < ? v v � w w  O K��  ��   n  x�� x L   F H y y m   F G���� ��   ^  z { z l  I I�� | }��   | 5 / main handler: first edit the profiles.ini ...     } � ~ ~ ^   m a i n   h a n d l e r :   f i r s t   e d i t   t h e   p r o f i l e s . i n i   . . .   {   �  r   I R � � � I   I N�������� 0 edit_profiles_ini  ��  ��   � o      ���� 0 err   �  � � � l  S S�� � ���   � I C ... if successful: copy the folder containing the JonDoFox profile    � � � � �   . . .   i f   s u c c e s s f u l :   c o p y   t h e   f o l d e r   c o n t a i n i n g   t h e   J o n D o F o x   p r o f i l e �  ��� � Z   S d � ����� � l  S X ����� � =   S X � � � o   S V���� 0 err   � m   V W����  ��  ��   � I   [ `�������� 0 copy_folder  ��  ��  ��  ��  ��   +  � � � l     ��������  ��  ��   �  � � � l     �� � ���   � / ) appends JonDoFox profile to profiles.ini    � � � � R   a p p e n d s   J o n D o F o x   p r o f i l e   t o   p r o f i l e s . i n i �  � � � i     � � � I      �������� 0 edit_profiles_ini  ��  ��   � k    
 � �  � � � l     �� � ���   � # new entries for profiles.ini     � � � � : n e w   e n t r i e s   f o r   p r o f i l e s . i n i   �  � � � r      � � � b      � � � b      � � � m      � � � � �  [ G e n e r a l ] � o    ��
�� 
ret  � m     � � � � � , S t a r t W i t h L a s t P r o f i l e = 0 � o      ���� 0 profiles_ini_header   �  � � � r     � � � b     � � � b     � � � b     � � � b     � � � b     � � � b     � � � o    	��
�� 
ret  � m   	 
 � � � � �  N a m e = J o n D o F o x � o    ��
�� 
ret  � m     � � � � �  I s R e l a t i v e = 1 � o    ��
�� 
ret  � m     � � � � �  P a t h = P r o f i l e s / � o    ���� 0 jondoprofile_foldername   � o      ���� 0 jondofox_profile_entry   �  � � � l   ��������  ��  ��   �  � � � l   ��������  ��  ��   �  � � � l   �� � ���   � u oread all the entries from the profile.ini to buf. (This will do because the file shouldn't be incredibly large)    � � � � � r e a d   a l l   t h e   e n t r i e s   f r o m   t h e   p r o f i l e . i n i   t o   b u f .   ( T h i s   w i l l   d o   b e c a u s e   t h e   f i l e   s h o u l d n ' t   b e   i n c r e d i b l y   l a r g e ) �  � � � r    $ � � � I   "�� ���
�� .rdwropenshor       file � 4    �� �
�� 
file � l    ����� � c     � � � o    ���� 0 profiles_ini   � m    ��
�� 
TEXT��  ��  ��   � o      ���� 0 profile_ini_fdr   �  � � � Q   % [ � � � � k   ( ; � �  � � � r   ( 5 � � � I  ( 3�� � �
�� .rdwrread****        **** � o   ( )���� 0 profile_ini_fdr   � �� ���
�� 
rdto � l  * / ����� � I  * /�� ���
�� .rdwrgeofcomp       **** � o   * +���� 0 profile_ini_fdr  ��  ��  ��  ��   � o      ���� 0 buf   �  ��� � I  6 ;�� ���
�� .rdwrclosnull���     **** � o   6 7���� 0 profile_ini_fdr  ��  ��   � R      ������
�� .ascrerr ****      � ****��  ��   � k   C [ � �  � � � I  C H�� ���
�� .rdwrclosnull���     **** � o   C D���� 0 profile_ini_fdr  ��   �  � � � I  I X�� � �
�� .sysodlogaskr        TEXT � m   I L � � � � � P E r r o r :   c o u l d n ' t   r e a d   F i r e f o x   p r o f i l e . i n i � �� ���
�� 
btns � J   O T � �  ��� � m   O R � � � � �  O K��  ��   �  ��� � L   Y [ � � m   Y Z���� ��   �  � � � l  \ \��������  ��  ��   �  � � � l  \ \� � ��   � ; 5 Detection of an already installed JonDoFox profile.     � � � � j   D e t e c t i o n   o f   a n   a l r e a d y   i n s t a l l e d   J o n D o F o x   p r o f i l e .   �  � � � l  \ \�~ � ��~   � Q K (Then replace it without messing up the profiles.ini with useless entries)    � �   �   ( T h e n   r e p l a c e   i t   w i t h o u t   m e s s i n g   u p   t h e   p r o f i l e s . i n i   w i t h   u s e l e s s   e n t r i e s ) �  Z   \ ��}�| l  \ a�{�z E  \ a o   \ ]�y�y 0 buf   m   ] ` �		  N a m e = J o n D o F o x�{  �z   k   d �

  I  d |�x
�x .sysodlogaskr        TEXT b   d m b   d i m   d g � \ Y o u   h a v e   a l r e a d y   i n s t a l l e d   a   J o n D o F o x   p r o f i l e . o   g h�w
�w 
ret  m   i l � F I f   y o u   c o n t i n u e   i t   w i l l   b e   r e p l a c e d �v�u
�v 
btns J   p x  m   p s �  C o n t i n u e �t m   s v � 
 A b o r t�t  �u    �s  Z   } �!"�r#! l  } �$�q�p$ =   } �%&% n   } �'(' 1   � ��o
�o 
bhit( 1   } ��n
�n 
rslt& m   � �)) �**  C o n t i n u e�q  �p  " L   � �++ m   � ��m�m  �r  # L   � �,, m   � ��l�l �s  �}  �|   -.- l  � ��k�j�i�k  �j  �i  . /0/ l  � ��h12�h  1 ) # saving old version of profiles.ini   2 �33 F   s a v i n g   o l d   v e r s i o n   o f   p r o f i l e s . i n i0 454 I   � ��g�f�e�g 0 backup_profile_ini  �f  �e  5 676 l  � ��d�c�b�d  �c  �b  7 898 l  � ��a:;�a  :   modify profiles.ini   ; �<< (   m o d i f y   p r o f i l e s . i n i9 =>= r   � �?@? b   � �ABA b   � �CDC b   � �EFE o   � ��`
�` 
ret F o   � ��_
�_ 
ret D I   � ��^G�]�^ 0 get_next_profile  G H�\H o   � ��[�[ 0 buf  �\  �]  B o   � ��Z�Z 0 jondofox_profile_entry  @ o      �Y�Y 0 complete_entry  > IJI Q   �KLMK k   � �NN OPO r   � �QRQ I  � ��XST
�X .rdwropenshor       fileS 4   � ��WU
�W 
alisU l  � �V�V�UV c   � �WXW o   � ��T�T 0 profiles_ini  X m   � ��S
�S 
TEXT�V  �U  T �RY�Q
�R 
permY m   � ��P
�P boovtrue�Q  R o      �O�O 0 profile_ini_fdw  P Z[Z l  � ��N\]�N  \ l frewriting the general header of profiles.ini will force Firefox to open the profile manager at startup   ] �^^ � r e w r i t i n g   t h e   g e n e r a l   h e a d e r   o f   p r o f i l e s . i n i   w i l l   f o r c e   F i r e f o x   t o   o p e n   t h e   p r o f i l e   m a n a g e r   a t   s t a r t u p[ _`_ I  � ��Mab
�M .rdwrwritnull���     ****a o   � ��L�L 0 profiles_ini_header  b �Kc�J
�K 
refnc o   � ��I�I 0 profile_ini_fdw  �J  ` ded l  � ��Hfg�H  f ( " append the JonDoFox profile entry   g �hh D   a p p e n d   t h e   J o n D o F o x   p r o f i l e   e n t r ye iji I  � ��Gkl
�G .rdwrwritnull���     ****k o   � ��F�F 0 complete_entry  l �Emn
�E 
wratm l  � �o�D�Co [   � �pqp l  � �r�B�Ar I  � ��@s�?
�@ .rdwrgeofcomp       ****s o   � ��>�> 0 profile_ini_fdw  �?  �B  �A  q m   � ��=�= �D  �C  n �<t�;
�< 
refnt o   � ��:�: 0 profile_ini_fdw  �;  j u�9u I  � ��8v�7
�8 .rdwrclosnull���     ****v o   � ��6�6 0 profile_ini_fdw  �7  �9  L R      �5�4�3
�5 .ascrerr ****      � ****�4  �3  M k   �ww xyx I  � ��2z�1
�2 .rdwrclosnull���     ****z o   � ��0�0 0 profile_ini_fdw  �1  y {|{ I  ��/}~
�/ .sysodlogaskr        TEXT} m   � � ��� P E r r o r :   c o u l d n ' t   e d i t   F i r e f o x   p r o f i l e . i n i~ �.��-
�. 
btns� J   � �� ��,� m   � ��� ���  O K�,  �-  | ��+� L  �� m  �*�* �+  J ��)� L  
�� m  	�(�(  �)   � ��� l     �'�&�%�'  �&  �%  � ��� l     �$���$  � J D copies the JonDoFox profile folder to the Firefox profile directory   � ��� �   c o p i e s   t h e   J o n D o F o x   p r o f i l e   f o l d e r   t o   t h e   F i r e f o x   p r o f i l e   d i r e c t o r y� ��� i    ��� I      �#�"�!�# 0 copy_folder  �"  �!  � Q     B���� O    '��� k    &�� ��� r    ��� c    ��� l   �� �� n    ��� m    �
� 
ctnr� l   ���� l   ���� I   ���
� .earsffdralis        afdr�  f    �  �  �  �  �  �   �  � m    �
� 
alis� o      �� 0 source_folder  � ��� I   &���
� .coreclon****      � ****� l   ���� c    ��� l   ���� b    ��� l   ���� c    ��� o    �� 0 source_folder  � m    �
� 
TEXT�  �  � o    �� 0 jondoprofile_foldername  �  �  � m    �

�
 
alis�  �  � �	��
�	 
insh� l    ���� c     ��� b    ��� o    �� 0 firefox_profiles_path  � m    �� ���  P r o f i l e s :� m    �
� 
alis�  �  � ���
� 
alrp� m   ! "�
� boovtrue�  �  � m    ���                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��  � R      �� ��
� .ascrerr ****      � ****�   ��  � k   / B�� ��� l  / /������  � D >if something goes wrong: restore old settings from backup file   � ��� | i f   s o m e t h i n g   g o e s   w r o n g :   r e s t o r e   o l d   s e t t i n g s   f r o m   b a c k u p   f i l e� ��� I   / 4�������� 0 restore_old_settings  ��  ��  � ���� I  5 B����
�� .sysodlogaskr        TEXT� m   5 6�� ��� V E r r o r :   c o u l d n ' t   f i n d   F i r e f o x   p r o f i l e   f o l d e r� �����
�� 
btns� J   9 >�� ���� m   9 <�� ���  O K��  ��  ��  � ��� l     ��������  ��  ��  � ��� l     ������  � 1 + find out the number of installed profiles    � ��� V   f i n d   o u t   t h e   n u m b e r   o f   i n s t a l l e d   p r o f i l e s  � ��� i    ��� I      ������� 0 get_next_profile  � ���� o      ���� 0 	prof_file  ��  ��  � k     -�� ��� r     ��� m     ��
�� boovtrue� o      ���� 0 not_reached  � ��� r    ��� m    ������� o      ���� 0 ctr  � ��� r    ��� m    	�� ���  � o      ���� 0 profile_header  � ��� V    *��� k    %�� ��� r    ��� l   ������ [    ��� o    ���� 0 ctr  � m    ���� ��  ��  � o      ���� 0 ctr  � ��� r    ��� b    ��� b    ��� m       �  [ P r o f i l e� o    ���� 0 ctr  � m     �  ]� o      ���� 0 profile_header  � �� r     % l    #���� E    #	 o     !���� 0 	prof_file  	 o   ! "���� 0 profile_header  ��  ��   o      ���� 0 not_reached  ��  � o    ���� 0 not_reached  � 
��
 L   + - o   + ,���� 0 profile_header  ��  �  l     ��������  ��  ��    l     ����   %  create a backup of profile.ini    � >   c r e a t e   a   b a c k u p   o f   p r o f i l e . i n i  i     I      �������� 0 backup_profile_ini  ��  ��   Q     U O    > k    =  Z    ) ���� l   !����! I   ��"��
�� .coredoexbool        obj " l   #����# 4    ��$
�� 
file$ l  	 %����% b   	 &'& o   	 
���� 0 firefox_profiles_path  ' o   
 ���� 0 profile_ini_backup_name  ��  ��  ��  ��  ��  ��  ��    k    %(( )*) I   ��+��
�� .coredeloobj        obj + c    ,-, l   .����. b    /0/ o    ���� 0 firefox_profiles_path  0 o    ���� 0 profile_ini_backup_name  ��  ��  - m    ��
�� 
alis��  * 1��1 I   %��2��
�� .fndremptnull��� ��� obj 2 1    !��
�� 
trsh��  ��  ��  ��   343 r   * 5565 l  * 37����7 I  * 3��89
�� .coreclon****      � ****8 o   * +���� 0 profiles_ini  9 ��:��
�� 
insh: l  , /;����; c   , /<=< o   , -���� 0 firefox_profiles_path  = m   - .��
�� 
alis��  ��  ��  ��  ��  6 o      ���� 0 backup_file  4 >��> r   6 =?@? c   6 9ABA o   6 7���� 0 profile_ini_backup_name  B m   7 8��
�� 
utxt@ n      CDC 1   : <��
�� 
pnamD o   9 :���� 0 backup_file  ��   m    EE�                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��   R      ������
�� .ascrerr ****      � ****��  ��   I  F U��FG
�� .sysodlogaskr        TEXTF m   F IHH �II � E r r o r   o c c u r e d   w h i l e   s a v i n g   p r o f i l e s . i n i .   T h i s   s h o u l d   n e v e r   h a p p e n .   P l e a s e   r e p o r t   t h i sG ��J��
�� 
btnsJ J   L QKK L��L m   L OMM �NN  O K��  ��   OPO l     ��������  ��  ��  P QRQ l     ��ST��  S Z T restore old settings in case the copy process of the JonDoFox profile folder fails    T �UU �   r e s t o r e   o l d   s e t t i n g s   i n   c a s e   t h e   c o p y   p r o c e s s   o f   t h e   J o n D o F o x   p r o f i l e   f o l d e r   f a i l s  R V��V i    WXW I      �������� 0 restore_old_settings  ��  ��  X Q     JYZ[Y O    7\]\ Z    6^_����^ l   `����` I   ��a��
�� .coredoexbool        obj a l   b����b 4    ��c
�� 
filec l  	 d����d b   	 efe o   	 
���� 0 firefox_profiles_path  f o   
 ���� 0 profile_ini_backup_name  ��  ��  ��  ��  ��  ��  ��  _ k    2gg hih I   ��j��
�� .coredeloobj        obj j o    ���� 0 profiles_ini  ��  i klk I   !��m��
�� .fndremptnull��� ��� obj m 1    ��
�� 
trsh��  l non r   " *pqp l  " (r����r 4   " (��s
�� 
files l  $ 't����t b   $ 'uvu o   $ %���� 0 firefox_profiles_path  v o   % &���� 0 profile_ini_backup_name  ��  ��  ��  ��  q o      ���� 0 backup_file  o w�w r   + 2xyx c   + .z{z m   + ,|| �}}  p r o f i l e s . i n i{ m   , -�~
�~ 
utxty n      ~~ 1   / 1�}
�} 
pnam o   . /�|�| 0 backup_file  �  ��  ��  ] m    ���                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��  Z R      �{�z�y
�{ .ascrerr ****      � ****�z  �y  [ I  ? J�x��
�x .sysodlogaskr        TEXT� m   ? @�� ��� � E r r o r   o c c u r e d   w h i l e   r e s t o r i n g   o l d   s e t t i n g s .   T h i s   s h o u l d   n e v e r   h a p p e n .   P l e a s e   r e p o r t   t h i s� �w��v
�w 
btns� J   A F�� ��u� m   A D�� ���  O K�u  �v  ��       �t��������t  � �s�r�q�p�o�n
�s .aevtoappnull  �   � ****�r 0 edit_profiles_ini  �q 0 copy_folder  �p 0 get_next_profile  �o 0 backup_profile_ini  �n 0 restore_old_settings  � �m -�l�k���j
�m .aevtoappnull  �   � ****�l  �k  �  �  D�i�h�g B�f N�e U�d [�c j�b�a�`�_ q�^ v�]�\�[�Z
�i 
cusr
�h 
ppth
�g 
TEXT�f 0 firefox_profiles_path  
�e .aevtquitnull��� ��� null�d 0 jondoprofile_foldername  �c 0 profile_ini_backup_name  
�b 
alis�a 0 profiles_ini  �`  �_  
�^ 
btns
�] .sysodlogaskr        TEXT�\ 0 edit_profiles_ini  �[ 0 err  �Z 0 copy_folder  �j e� *�,�,�&�%E�UO� *j UO�E�O�E�O ��%�&E�W X  a a a kvl OkO*j+ E` O_ j  
*j+ Y h� �Y ��X�W���V�Y 0 edit_profiles_ini  �X  �W  � �U�T�S�R�Q�P�U 0 profiles_ini_header  �T 0 jondofox_profile_entry  �S 0 profile_ini_fdr  �R 0 buf  �Q 0 complete_entry  �P 0 profile_ini_fdw  � ' ��O � � � ��N�M�L�K�J�I�H�G�F�E�D ��C ��B�A�@)�?�>�=�<�;�:�9�8�
�O 
ret �N 0 jondoprofile_foldername  
�M 
file�L 0 profiles_ini  
�K 
TEXT
�J .rdwropenshor       file
�I 
rdto
�H .rdwrgeofcomp       ****
�G .rdwrread****        ****
�F .rdwrclosnull���     ****�E  �D  
�C 
btns
�B .sysodlogaskr        TEXT
�A 
rslt
�@ 
bhit�? 0 backup_profile_ini  �> 0 get_next_profile  
�= 
alis
�< 
perm
�; 
refn
�: .rdwrwritnull���     ****
�9 
wrat�8 �V��%�%E�O��%�%�%�%�%�%E�O*���&/j 
E�O ��j l E�O�j W X  �j Oa a a kvl OkO�a  3a �%a %a a a lvl O_ a ,a   jY kY hO*j+ O��%*�k+ %�%E�O =*a ��&/a  el 
E�O�a !�l "O�a #�j ka !�a $ "O�j W X  �j Oa %a a &kvl OkOj� �7��6�5���4�7 0 copy_folder  �6  �5  � �3�3 0 source_folder  � ��2�1�0�/�.�-�,��+�*�)�(�'�&��%��$
�2 .earsffdralis        afdr
�1 
ctnr
�0 
alis
�/ 
TEXT�. 0 jondoprofile_foldername  
�- 
insh�, 0 firefox_profiles_path  
�+ 
alrp�* 
�) .coreclon****      � ****�(  �'  �& 0 restore_old_settings  
�% 
btns
�$ .sysodlogaskr        TEXT�4 C )� !)j �,�&E�O��&�%�&���%�&�e� UW X  *j+ O�a a kvl � �#��"�!��� �# 0 get_next_profile  �" ��� �  �� 0 	prof_file  �!  � ����� 0 	prof_file  � 0 not_reached  � 0 ctr  � 0 profile_header  � � �  .eE�OiE�O�E�O h��kE�O�%�%E�O��E�[OY��O�� ������� 0 backup_profile_ini  �  �  � �� 0 backup_file  � E�����������
�	���H�M�
� 
file� 0 firefox_profiles_path  � 0 profile_ini_backup_name  
� .coredoexbool        obj 
� 
alis
� .coredeloobj        obj 
� 
trsh
� .fndremptnull��� ��� obj � 0 profiles_ini  
� 
insh
�
 .coreclon****      � ****
�	 
utxt
� 
pnam�  �  
� 
btns
� .sysodlogaskr        TEXT� V @� 8*���%/j  ��%�&j O*�,j Y hO����&l E�O��&��,FUW X  a a a kvl � �X����� � 0 restore_old_settings  �  �  � ���� 0 backup_file  � �����������������|��������������
�� 
file�� 0 firefox_profiles_path  �� 0 profile_ini_backup_name  
�� .coredoexbool        obj �� 0 profiles_ini  
�� .coredeloobj        obj 
�� 
trsh
�� .fndremptnull��� ��� obj 
�� 
utxt
�� 
pnam��  ��  
�� 
btns
�� .sysodlogaskr        TEXT�  K 9� 1*���%/j  #�j O*�,j O*���%/E�O��&��,FY hUW X  ��a kvl ascr  ��ޭ